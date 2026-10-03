import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();

    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        post: { select: { id: true, title: true, type: true, status: true } },
        plan: { select: { id: true, title: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true, level: true, trustScore: true } },
          },
        },
        messages: {
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const isMember = chat.members.some((m) => m.userId === session?.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden. You are not a member of this chat.' }, { status: 403 });
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Fetch chat messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat messages' }, { status: 500 });
  }
}

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

    const { text, mediaUrl } = await request.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Message text cannot be empty' }, { status: 400 });
    }

    const chatMember = await prisma.chatUser.findFirst({
      where: { chatId: id, userId: session.id },
    });

    if (!chatMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        chatId: id,
        senderId: session.id,
        text: text.trim(),
        mediaUrl: mediaUrl || null,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update chat updatedAt timestamp
    await prisma.chat.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Send Notification to recipient members
    const otherMembers = await prisma.chatUser.findMany({
      where: { chatId: id, userId: { not: session.id } },
    });

    for (const om of otherMembers) {
      await prisma.notification.create({
        data: {
          userId: om.userId,
          title: '💬 New Message',
          message: `${session.name}: "${text.length > 40 ? text.substring(0, 37) + '...' : text}"`,
          link: `/chat/${id}`,
          type: 'CHAT',
        },
      });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
