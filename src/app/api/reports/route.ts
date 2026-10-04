import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id }, select: { role: true } });
    if (!user || !['MODERATOR', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Moderator access required' }, { status: 403 });
    }

    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { id: true, name: true } },
        targetUser: { select: { id: true, name: true } },
        targetPost: { select: { id: true, title: true, type: true } },
      },
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { id: session.id }, select: { role: true } });
    if (!user || !['MODERATOR', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Moderator access required' }, { status: 403 });
    }

    const { reportId, status, actionTaken } = await request.json();
    if (!reportId || !['REVIEWED', 'ACTIONED'].includes(status)) {
      return NextResponse.json({ error: 'Choose a valid report action.' }, { status: 400 });
    }
    const report = await prisma.report.update({
      where: { id: reportId },
      data: { status, actionTaken: typeof actionTaken === 'string' ? actionTaken.slice(0, 500) : null },
    });
    return NextResponse.json({ report });
  } catch (error) {
    console.error('Moderation update error:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId, targetPostId, reason } = await request.json();
    if ((!targetUserId && !targetPostId) || (targetUserId && targetPostId) || typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json({ error: 'Choose one user or post and provide a reason.' }, { status: 400 });
    }
    if (targetUserId === session.id) {
      return NextResponse.json({ error: 'You cannot report yourself.' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.id,
        targetUserId: targetUserId || null,
        targetPostId: targetPostId || null,
        reason: reason || 'Community Safety Policy Violation',
        status: 'PENDING',
      },
    });

    return NextResponse.json({ report, message: 'Report submitted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
