import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ reports: [] });
    }

    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { id: true, name: true } },
        targetUser: { select: { id: true, name: true } },
        targetPost: { select: { id: true, title: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId, targetPostId, reason } = await request.json();

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
