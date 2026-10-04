import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ chats: [] });
    }

    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: { userId: session.id },
        },
      },
      include: {
        post: { select: { id: true, title: true, type: true } },
        plan: { select: { id: true, title: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true, level: true, trustScore: true } },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Fetch chats error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat list' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId, postId, planId, name } = await request.json();

    if (targetUserId) {
      if (targetUserId === session.id) return NextResponse.json({ error: 'Cannot start a chat with yourself.' }, { status: 400 });
      const block = await prisma.userBlock.findFirst({ where: { OR: [
        { blockerId: session.id, blockedUserId: targetUserId },
        { blockerId: targetUserId, blockedUserId: session.id },
      ] }, select: { id: true } });
      if (block) return NextResponse.json({ error: 'This connection is unavailable.' }, { status: 403 });
      // Find or create direct chat
      let chat = await prisma.chat.findFirst({
        where: {
          type: 'DIRECT',
          members: {
            every: {
              userId: { in: [session.id, targetUserId] },
            },
          },
        },
      });

      if (!chat) {
        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        chat = await prisma.chat.create({
          data: {
            type: 'DIRECT',
            postId: postId || null,
            planId: planId || null,
            name: name || `Chat with ${targetUser?.name || 'Peer'}`,
            members: {
              create: [{ userId: session.id }, { userId: targetUserId }],
            },
          },
        });
      }

      return NextResponse.json({ chat });
    }

    return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}
