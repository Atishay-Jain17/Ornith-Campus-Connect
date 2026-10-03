import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { recordTrustEvent } from '@/lib/reputation';

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId, scoreChange, feedbackAttribute, note, postId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    if (targetUserId === session.id) {
      return NextResponse.json({ error: 'Cannot rate yourself' }, { status: 400 });
    }

    const validAttributes = ['Reliable', 'Helpful', 'On_time', 'Honest', 'Good_communicator'];
    const attr = validAttributes.includes(feedbackAttribute) ? feedbackAttribute : 'Reliable';

    const result = await recordTrustEvent(
      targetUserId,
      session.id,
      parseFloat(scoreChange || '0.15'),
      attr,
      note,
      postId
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Trust rate error:', error);
    return NextResponse.json({ error: 'Failed to record trust rating' }, { status: 500 });
  }
}
