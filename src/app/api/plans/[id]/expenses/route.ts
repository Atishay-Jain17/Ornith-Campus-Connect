import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculatePlanSettlement } from '@/lib/expenses';

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

    const { amount, description, isShared, participantUserIds } = await request.json();

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        groupMembers: { include: { user: true } },
        expenses: { include: { payer: true, participants: { include: { user: true } } } },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const totalAmount = parseFloat(amount);
    const isSharedBool = isShared !== false;

    // Determine target beneficiaries
    let targetUserIds: string[] = [];

    if (!isSharedBool) {
      // Personal expense -> payer only
      targetUserIds = [session.id];
    } else if (Array.isArray(participantUserIds) && participantUserIds.length > 0) {
      targetUserIds = participantUserIds;
    } else {
      // Default shared -> all plan group members
      targetUserIds = plan.groupMembers.map((m) => m.userId);
    }

    const perPersonShare = targetUserIds.length > 0 ? Math.round((totalAmount / targetUserIds.length) * 100) / 100 : totalAmount;

    // Create Expense and ExpenseParticipants
    const newExpense = await prisma.expense.create({
      data: {
        planId: id,
        payerId: session.id,
        amount: totalAmount,
        description: description || 'Group Expense',
        isShared: isSharedBool,
        participants: {
          create: targetUserIds.map((uId) => ({
            userId: uId,
            shareAmount: perPersonShare,
          })),
        },
      },
      include: {
        payer: { select: { id: true, name: true } },
        participants: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    // Recompute settlement transfers for the plan
    const updatedPlan = await prisma.plan.findUnique({
      where: { id },
      include: {
        groupMembers: { include: { user: true } },
        expenses: { include: { payer: true, participants: { include: { user: true } } } },
      },
    });

    if (updatedPlan) {
      const memberList = updatedPlan.groupMembers.map((gm) => ({
        userId: gm.userId,
        userName: gm.user.name,
      }));

      const expenseItems = updatedPlan.expenses.map((exp) => ({
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

      const settlementRes = calculatePlanSettlement(memberList, expenseItems);

      // Refresh Settlements table for this plan
      await prisma.settlement.deleteMany({ where: { planId: id } });

      for (const st of settlementRes.settlements) {
        await prisma.settlement.create({
          data: {
            planId: id,
            fromUserId: st.fromUserId,
            toUserId: st.toUserId,
            amount: st.amount,
            status: 'PENDING',
          },
        });
      }

      // Notify other group members
      for (const gm of updatedPlan.groupMembers) {
        if (gm.userId !== session.id) {
          await prisma.notification.create({
            data: {
              userId: gm.userId,
              title: '💰 Group Expense Added',
              message: `${session.name} added ₹${totalAmount} for "${description}" in ${plan.title}`,
              link: `/plans/${plan.id}`,
              type: 'EXPENSE',
            },
          });
        }
      }

      return NextResponse.json({
        expense: newExpense,
        settlementSummary: settlementRes,
      });
    }

    return NextResponse.json({ expense: newExpense });
  } catch (error) {
    console.error('Add expense error:', error);
    return NextResponse.json({ error: 'Failed to record expense' }, { status: 500 });
  }
}
