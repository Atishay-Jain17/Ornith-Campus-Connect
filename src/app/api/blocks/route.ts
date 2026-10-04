import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const targetId = new URL(request.url).searchParams.get('userId');
  if (targetId) {
    const block = await prisma.userBlock.findFirst({
      where: { OR: [
        { blockerId: session.id, blockedUserId: targetId },
        { blockerId: targetId, blockedUserId: session.id },
      ] },
      select: { id: true, blockerId: true },
    });
    return NextResponse.json({ isBlocked: Boolean(block), blockedByMe: block?.blockerId === session.id });
  }
  const blocks = await prisma.userBlock.findMany({ where: { blockerId: session.id }, include: { blockedUser: { select: { id: true, name: true } } } });
  return NextResponse.json({ blocks });
}

export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { blockedUserId } = await request.json();
  if (!blockedUserId || blockedUserId === session.id) return NextResponse.json({ error: 'Choose another user to block.' }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id: blockedUserId }, select: { id: true } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  await prisma.userBlock.upsert({ where: { blockerId_blockedUserId: { blockerId: session.id, blockedUserId } }, create: { blockerId: session.id, blockedUserId }, update: {} });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { blockedUserId } = await request.json();
  if (!blockedUserId) return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  await prisma.userBlock.deleteMany({ where: { blockerId: session.id, blockedUserId } });
  return NextResponse.json({ success: true });
}
