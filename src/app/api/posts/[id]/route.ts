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

    const post = await prisma.post.findUnique({
      where: { id },
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
            bio: true,
          },
        },
        interests: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, level: true, trustScore: true },
            },
          },
        },
        matchesSource: {
          include: {
            targetPost: {
              include: { author: { select: { id: true, name: true, avatar: true } } },
            },
            matchedUser: {
              select: { id: true, name: true, avatar: true, trustScore: true },
            },
          },
        },
        chats: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      post,
      isAuthor: session?.id === post.authorId,
    });
  } catch (error) {
    console.error('Fetch post detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch post details' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== session.id) {
      return NextResponse.json({ error: 'Forbidden. Only post author can change lifecycle status.' }, { status: 403 });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post status' }, { status: 500 });
  }
}
