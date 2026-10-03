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
        interests: true,
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

    return NextResponse.json({ posts: postsWithDistance });
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
        latitude: latitude || 30.2687,
        longitude: longitude || 78.0076,
        areaName: areaName || 'Graphic Era Area',
        radiusKm: finalRadius,
        routeOrigin: routeOrigin || extracted?.routeOrigin || null,
        routeDestination: routeDestination || extracted?.routeDestination || null,
        departureTime: departureTime ? new Date(departureTime) : null,
        capacity: capacity ? parseInt(capacity) : extracted?.capacity || null,
        price: price ? parseFloat(price) : extracted?.price || null,
        contributionMode: contributionMode || extracted?.contributionMode || 'FREE',
        tags: JSON.stringify(extracted?.tags || []),
        riskIndicators: JSON.stringify(extracted?.riskIndicators || []),
        expiresAt: extracted?.suggestedExpiryHours
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
