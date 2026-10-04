import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordTrustEvent } from '@/lib/reputation';

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId, feedbackAttribute, note, postId } = await request.json();

    if (!targetUserId || !postId) {
      return NextResponse.json({ error: 'A completed exchange is required to leave a rating.' }, { status: 400 });
    }

    if (targetUserId === session.id) {
      return NextResponse.json({ error: 'Cannot rate yourself' }, { status: 400 });
    }

    const completedPost = await prisma.post.findFirst({ where: { id: postId, authorId: targetUserId, status: 'COMPLETED' }, select: { id: true } });
    if (!completedPost) return NextResponse.json({ error: 'Ratings are available after the post owner marks an exchange complete.' }, { status: 403 });
    const priorRating = await prisma.trustEvent.findFirst({ where: { postId, raterUserId: session.id } });
    if (priorRating) return NextResponse.json({ error: 'You have already rated this exchange.' }, { status: 409 });

    const validAttributes = ['Reliable', 'Helpful', 'On_time', 'Honest', 'Good_communicator'];
    const attr = validAttributes.includes(feedbackAttribute) ? feedbackAttribute : 'Reliable';

    const result = await recordTrustEvent(
      targetUserId,
      session.id,
      0.15,
      attr,
      typeof note === 'string' ? note.slice(0, 500) : undefined,
      postId
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Trust rate error:', error);
    return NextResponse.json({ error: 'Failed to record trust rating' }, { status: 500 });
  }
}
