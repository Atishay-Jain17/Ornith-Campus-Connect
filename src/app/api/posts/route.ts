import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateDistanceKm } from '@/lib/geo';
import { extractIntentFromText } from '@/lib/ai-engine';
import { awardXP } from '@/lib/reputation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const radius = parseFloat(searchParams.get('radius') || '10');
    const userLat = parseFloat(searchParams.get('lat') || '30.2687');
    const userLng = parseFloat(searchParams.get('lng') || '78.0076');
    const status = searchParams.get('status') || 'ACTIVE';

    const whereClause: any = {};
    const session = await getCurrentUser();
    if (session) {
      const blocks = await prisma.userBlock.findMany({
        where: { OR: [{ blockerId: session.id }, { blockedUserId: session.id }] },
        select: { blockerId: true, blockedUserId: true },
      });
      const hiddenAuthors = new Set<string>();
      for (const block of blocks) hiddenAuthors.add(block.blockerId === session.id ? block.blockedUserId : block.blockerId);
      if (hiddenAuthors.size) whereClause.authorId = { notIn: Array.from(hiddenAuthors) };
    }
    if (status !== 'ALL') {
      whereClause.status = status;
    }
    if (type && type !== 'ALL') {
      whereClause.type = type;
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }
    if (status === 'ACTIVE') {
      whereClause.AND = [
        ...(whereClause.AND || []),
        { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      ];
    }

    const rawPosts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            level: true,
            trustScore: true,
            isVerified: true,
            area: true,
          },
        },
        _count: {
          select: { matchesSource: true, chats: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute proximity and filter by radius
    const postsWithDistance = rawPosts
      .map((post) => {
        const distanceKm = calculateDistanceKm(userLat, userLng, post.latitude, post.longitude);
        return {
          ...post,
          distanceKm,
          isWithinRadius: distanceKm <= radius || post.radiusKm >= distanceKm,
        };
      })
      .filter((post) => post.isWithinRadius);

    // Keep precise coordinates private. Discovery uses distance and area only.
    const publicPosts = postsWithDistance.map(({ latitude, longitude, ...post }) => post);
    return NextResponse.json({ posts: publicPosts });
  } catch (error) {
    console.error('Fetch posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const { rawText, customTitle, customDescription, typeOverride, latitude, longitude, areaName, radiusKm, routeOrigin, routeDestination, departureTime, capacity, price, contributionMode } = body;

    // Run AI Intent Extractor if raw text is provided
    let extracted = rawText ? extractIntentFromText(rawText) : null;

    const finalType = typeOverride || extracted?.type || 'NEED';
    const finalTitle = customTitle || extracted?.title || rawText || 'Community Post';
    const finalDesc = customDescription || rawText || '';
    const finalCategory = extracted?.category || 'General';
    const finalRadius = radiusKm ? parseFloat(radiusKm) : extracted?.radiusKm || 2.0;
    const allowedTypes = ['NEED', 'OFFER', 'BORROW', 'LEND', 'BUY', 'SELL', 'GIVE', 'RENT', 'SERVICE', 'PLAN', 'RIDE', 'GROUP_BUY', 'COMMUNITY', 'OPPORTUNITY', 'LOST_FOUND'];
    const allowedContributionModes = ['FREE', 'EQUAL_SPLIT', 'FIXED', 'CUSTOM'];
    const parsedPrice = price !== undefined && price !== null && price !== '' ? Number(price) : extracted?.price;
    const parsedCapacity = capacity !== undefined && capacity !== null && capacity !== '' ? Number(capacity) : extracted?.capacity;
    const parsedDeparture = departureTime ? new Date(departureTime) : null;
    if (!allowedTypes.includes(finalType) || typeof finalTitle !== 'string' || !finalTitle.trim() || finalTitle.length > 120 || typeof finalDesc !== 'string' || finalDesc.length > 3000 || !Number.isFinite(finalRadius) || finalRadius <= 0 || (parsedPrice !== undefined && parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) || (parsedCapacity !== undefined && parsedCapacity !== null && (!Number.isInteger(parsedCapacity) || parsedCapacity < 1 || parsedCapacity > 50)) || (parsedDeparture && !Number.isFinite(parsedDeparture.getTime()))) {
      return NextResponse.json({ error: 'Review the title, description, radius, price, seats, and time, then try again.' }, { status: 400 });
    }

    // Enforce Level 5 Gate for OPPORTUNITY posts (PDF Section 8 & 10)
    if (finalType === 'OPPORTUNITY') {
      const user = await prisma.user.findUnique({ where: { id: session.id } });
      if (!user || user.level < 5 || !user.isVerified) {
        return NextResponse.json(
          { error: 'Posting Opportunities requires a Verified Level 5+ profile.' },
          { status: 403 }
        );
      }
    }

    const post = await prisma.post.create({
      data: {
        authorId: session.id,
        type: finalType,
        title: finalTitle,
        description: finalDesc,
        category: finalCategory,
        latitude: 30.2687,
        longitude: 78.0076,
        areaName: typeof areaName === 'string' ? areaName.trim().slice(0, 80) : 'Graphic Era Area',
        radiusKm: finalRadius,
        routeOrigin: routeOrigin || extracted?.routeOrigin || null,
        routeDestination: routeDestination || extracted?.routeDestination || null,
        departureTime: parsedDeparture,
        capacity: parsedCapacity ?? null,
        price: parsedPrice ?? null,
        contributionMode: allowedContributionModes.includes(contributionMode) ? contributionMode : parsedPrice !== undefined ? 'FIXED' : extracted?.contributionMode || 'FREE',
        tags: JSON.stringify(extracted?.tags || []),
        riskIndicators: JSON.stringify(extracted?.riskIndicators || []),
        expiresAt: finalType === 'RIDE' && parsedDeparture
          ? new Date(parsedDeparture.getTime() + 2 * 3600 * 1000)
          : extracted?.suggestedExpiryHours
            ? new Date(Date.now() + extracted.suggestedExpiryHours * 3600 * 1000)
            : null,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, level: true, trustScore: true, isVerified: true },
        },
      },
    });

    // Award XP for post creation
    await awardXP(session.id, 'CREATE_POST', 30, `Created post: ${finalTitle}`);

    return NextResponse.json({ post, extractedIntent: extracted });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
