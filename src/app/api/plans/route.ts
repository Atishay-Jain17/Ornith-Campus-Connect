import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { awardXP } from '@/lib/reputation';

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, level: true, trustScore: true },
        },
        groupMembers: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        expenses: true,
        _count: { select: { groupMembers: true, expenses: true } },
      },
      orderBy: { eventTime: 'asc' },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, locationName, latitude, longitude, eventTime, capacity, budget, purpose, vibeTags } = await request.json();

    const plan = await prisma.plan.create({
      data: {
        creatorId: session.id,
        title,
        description,
        locationName: locationName || 'Graphic Era Campus',
        latitude: latitude || 30.2687,
        longitude: longitude || 78.0076,
        eventTime: new Date(eventTime),
        capacity: capacity ? parseInt(capacity) : 6,
        budget: budget ? parseFloat(budget) : null,
        purpose: purpose || 'Hangout',
        vibeTags: Array.isArray(vibeTags) ? JSON.stringify(vibeTags) : vibeTags || '[]',
        groupMembers: {
          create: {
            userId: session.id,
            role: 'HOST',
            status: 'JOINED',
          },
        },
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        groupMembers: true,
      },
    });

    await awardXP(session.id, 'CREATE_PLAN', 40, `Created group plan: ${title}`);

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}
