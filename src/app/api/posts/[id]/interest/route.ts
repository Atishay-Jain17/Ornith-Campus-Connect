import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, action, interestId } = await request.json();

    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Accept / Reject Interest
    if (action === 'ACCEPT' || action === 'REJECT') {
      if (post.authorId !== session.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const updatedInterest = await prisma.postInterest.update({
        where: { id: interestId },
        data: { status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED' },
        include: { user: true },
      });

      if (action === 'ACCEPT') {
        // Create 1:1 Direct Chat room between Post Author & Interested User
        const existingChat = await prisma.chat.findFirst({
          where: {
            postId: post.id,
            members: {
              every: {
                userId: { in: [post.authorId, updatedInterest.userId] },
              },
            },
          },
        });

        let chat = existingChat;
        if (!chat) {
          chat = await prisma.chat.create({
            data: {
              postId: post.id,
              type: 'DIRECT',
              name: `${post.title} - ${updatedInterest.user.name}`,
              members: {
                create: [
                  { userId: post.authorId },
                  { userId: updatedInterest.userId },
                ],
              },
            },
          });
        }

        // Send initial connection message in chat
        await prisma.chatMessage.create({
          data: {
            chatId: chat.id,
            senderId: session.id,
            text: `👋 Accepted interest for post: "${post.title}". Chat room connected!`,
          },
        });

        // Update post lifecycle to MATCHED
        await prisma.post.update({
          where: { id: post.id },
          data: { status: 'MATCHED' },
        });

        // Send Notification
        await prisma.notification.create({
          data: {
            userId: updatedInterest.userId,
            title: '🎉 Interest Accepted!',
            message: `${session.name} accepted your interest in "${post.title}". Chat room created!`,
            link: `/chat/${chat.id}`,
            type: 'MATCH',
          },
        });

        return NextResponse.json({ interest: updatedInterest, chatId: chat.id });
      }

      return NextResponse.json({ interest: updatedInterest });
    }

    // Express Interest
    const existingInterest = await prisma.postInterest.findFirst({
      where: { postId: id, userId: session.id },
    });

    if (existingInterest) {
      return NextResponse.json({ error: 'You have already expressed interest in this post.' }, { status: 400 });
    }

    const newInterest = await prisma.postInterest.create({
      data: {
        postId: id,
        userId: session.id,
        message: message || 'Interested in connecting!',
        status: 'PENDING',
      },
    });

    // Notify post author
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        title: '🔔 New Interest Received',
        message: `${session.name} is interested in your post: "${post.title}"`,
        link: `/posts/${post.id}`,
        type: 'MATCH',
      },
    });

    return NextResponse.json({ interest: newInterest });
  } catch (error) {
    console.error('Post interest error:', error);
    return NextResponse.json({ error: 'Failed to record interest' }, { status: 500 });
  }
}
