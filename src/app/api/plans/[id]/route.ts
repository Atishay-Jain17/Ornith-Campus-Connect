import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculatePlanSettlement } from '@/lib/expenses';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, level: true, trustScore: true },
        },
        groupMembers: {
          include: {
            user: { select: { id: true, name: true, avatar: true, level: true, trustScore: true } },
          },
        },
        expenses: {
          include: {
            payer: { select: { id: true, name: true, avatar: true } },
            participants: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        settlements: {
          include: {
            fromUser: { select: { id: true, name: true } },
            toUser: { select: { id: true, name: true } },
          },
        },
        chats: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Compute live settlement calculation engine
    const memberList = plan.groupMembers.map((gm) => ({
      userId: gm.userId,
      userName: gm.user.name,
    }));

    const expenseItems = plan.expenses.map((exp) => ({
      id: exp.id,
      payerId: exp.payerId,
      payerName: exp.payer.name,
      amount: exp.amount,
      description: exp.description,
      isShared: exp.isShared,
      participants: exp.participants.map((p) => ({
        userId: p.userId,
        userName: p.user.name,
        shareAmount: p.shareAmount,
      })),
    }));

    const settlementEngineResult = calculatePlanSettlement(memberList, expenseItems);

    const isMember = plan.groupMembers.some((gm) => gm.userId === session?.id);
    const isHost = plan.creatorId === session?.id;

    return NextResponse.json({
      plan,
      settlementSummary: settlementEngineResult,
      isMember,
      isHost,
    });
  } catch (error) {
    console.error('Fetch plan detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch plan details' }, { status: 500 });
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

    const { action } = await request.json();

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: { groupMembers: true },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (action === 'JOIN') {
      const existingMember = plan.groupMembers.find((gm) => gm.userId === session.id);
      if (existingMember) {
        return NextResponse.json({ message: 'Already a group member' });
      }

      if (plan.groupMembers.length >= plan.capacity) {
        return NextResponse.json({ error: 'Plan capacity reached' }, { status: 400 });
      }

      const member = await prisma.groupMember.create({
        data: {
          planId: id,
          userId: session.id,
          role: 'MEMBER',
          status: 'JOINED',
        },
      });

      // Notify plan creator
      await prisma.notification.create({
        data: {
          userId: plan.creatorId,
          title: '🎉 New Plan Participant',
          message: `${session.name} joined your plan: "${plan.title}"`,
          link: `/plans/${plan.id}`,
          type: 'SYSTEM',
        },
      });

      return NextResponse.json({ member });
    } else if (action === 'LEAVE') {
      await prisma.groupMember.deleteMany({
        where: { planId: id, userId: session.id },
      });
      return NextResponse.json({ message: 'Left plan successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update plan membership' }, { status: 500 });
  }
}
