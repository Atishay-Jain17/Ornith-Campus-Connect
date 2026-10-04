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
        chats: { select: { id: true, name: true, type: true } },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Compute live settlement calculation engine
    const memberList = plan.groupMembers.filter((gm) => gm.status === 'JOINED').map((gm) => ({
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

    const isMember = plan.groupMembers.some((gm) => gm.userId === session?.id && gm.status === 'JOINED');
    const isPending = plan.groupMembers.some((gm) => gm.userId === session?.id && gm.status === 'PENDING');
    const isHost = plan.creatorId === session?.id;
    const visiblePlan = {
      ...plan,
      latitude: undefined,
      longitude: undefined,
      groupMembers: plan.groupMembers.filter((member) => member.status === 'JOINED' || isHost),
      expenses: isMember ? plan.expenses : [],
      settlements: isMember ? plan.settlements : [],
    };

    return NextResponse.json({
      plan: visiblePlan,
      settlementSummary: isMember ? settlementEngineResult : null,
      isMember,
      isPending,
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

    const { action, memberId } = await request.json();

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
        return NextResponse.json({ message: existingMember.status === 'PENDING' ? 'Your request is awaiting host approval.' : 'Already a group member', status: existingMember.status });
      }

      const joinedCount = plan.groupMembers.filter((member) => member.status === 'JOINED').length;
      if (joinedCount >= plan.capacity) {
        return NextResponse.json({ error: 'Plan capacity reached' }, { status: 400 });
      }

      const member = await prisma.groupMember.create({
        data: {
          planId: id,
          userId: session.id,
          role: 'MEMBER',
          status: 'PENDING',
        },
      });

      // Hosts approve each request before a stranger joins.
      await prisma.notification.create({
        data: {
          userId: plan.creatorId,
          title: '👋 Plan join request',
          message: `${session.name} asked to join "${plan.title}". Review the request before they join.`,
          link: `/plans/${plan.id}`,
          type: 'SYSTEM',
        },
      });

      return NextResponse.json({ member, message: 'Request sent. The host will review it.' });
    } else if (action === 'APPROVE' || action === 'REJECT') {
      if (plan.creatorId !== session.id) return NextResponse.json({ error: 'Only the host can review join requests.' }, { status: 403 });
      const requestedMember = await prisma.groupMember.findFirst({ where: { id: memberId, planId: id, status: 'PENDING' } });
      if (!requestedMember) return NextResponse.json({ error: 'Join request not found.' }, { status: 404 });
      if (action === 'APPROVE') {
        const joinedCount = await prisma.groupMember.count({ where: { planId: id, status: 'JOINED' } });
        if (joinedCount >= plan.capacity) return NextResponse.json({ error: 'Plan capacity reached.' }, { status: 409 });
        await prisma.groupMember.update({ where: { id: requestedMember.id }, data: { status: 'JOINED' } });
        const groupChat = await prisma.chat.findFirst({ where: { planId: id }, select: { id: true } });
        if (groupChat) await prisma.chatUser.create({ data: { chatId: groupChat.id, userId: requestedMember.userId } });
        await prisma.notification.create({ data: { userId: requestedMember.userId, title: 'You’re in!', message: `The host accepted your request to join "${plan.title}".`, link: `/plans/${plan.id}`, type: 'SYSTEM' } });
      } else {
        await prisma.groupMember.delete({ where: { id: requestedMember.id } });
        await prisma.notification.create({ data: { userId: requestedMember.userId, title: 'Plan request update', message: `The host could not add you to "${plan.title}" this time.`, link: `/plans/${plan.id}`, type: 'SYSTEM' } });
      }
      return NextResponse.json({ success: true });
    } else if (action === 'LEAVE') {
      if (plan.creatorId === session.id) return NextResponse.json({ error: 'The host cannot leave their own plan.' }, { status: 400 });
      await prisma.groupMember.deleteMany({
        where: { planId: id, userId: session.id },
      });
      const groupChat = await prisma.chat.findFirst({ where: { planId: id }, select: { id: true } });
      if (groupChat) await prisma.chatUser.deleteMany({ where: { chatId: groupChat.id, userId: session.id } });
      return NextResponse.json({ message: 'Left plan successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update plan membership' }, { status: 500 });
  }
}
