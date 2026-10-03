import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateMatchScore } from '@/lib/ai-engine';

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

    // Get all candidate active posts except author's own posts
    const candidatePosts = await prisma.post.findMany({
      where: {
        id: { not: id },
        authorId: { not: sourcePost.authorId },
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
      const matchResult = calculateMatchScore(sourcePost, candidate);
      if (matchResult.score >= 0.4) {
        matches.push({
          targetPost: candidate,
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
