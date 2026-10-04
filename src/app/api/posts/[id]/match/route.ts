import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateMatchScore } from '@/lib/ai-engine';
import { getCurrentUser } from '@/lib/auth';
import { calculateDistanceKm } from '@/lib/geo';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sourcePost = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!sourcePost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const session = await getCurrentUser();
    const blocks = session ? await prisma.userBlock.findMany({ where: { OR: [
      { blockerId: session.id }, { blockedUserId: session.id },
    ] }, select: { blockerId: true, blockedUserId: true } }) : [];
    const hiddenAuthors = new Set<string>();
    for (const block of blocks) hiddenAuthors.add(block.blockerId === session?.id ? block.blockedUserId : block.blockerId);

    // Get all candidate active posts except author's own posts
    const candidatePosts = await prisma.post.findMany({
      where: {
        id: { not: id },
        authorId: { notIn: [sourcePost.authorId, ...hiddenAuthors] },
        status: 'ACTIVE',
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, level: true, trustScore: true, isVerified: true, area: true },
        },
      },
    });

    const matches: any[] = [];

    for (const candidate of candidatePosts) {
      if (calculateDistanceKm(sourcePost.latitude, sourcePost.longitude, candidate.latitude, candidate.longitude) > Math.max(sourcePost.radiusKm, candidate.radiusKm)) continue;
      const matchResult = calculateMatchScore(sourcePost, candidate);
      if (matchResult.score >= 0.4) {
        matches.push({
          targetPost: (({ latitude: _latitude, longitude: _longitude, ...publicPost }) => publicPost)(candidate),
          matchScore: matchResult.score,
          matchReason: matchResult.reason,
          matchedUser: candidate.author,
        });
      }
    }

    // Sort by highest match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('AI match calculation error:', error);
    return NextResponse.json({ error: 'Failed to compute AI matches' }, { status: 500 });
  }
}
