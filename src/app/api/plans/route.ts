import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { awardXP } from '@/lib/reputation';

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { status: { in: ['UPCOMING', 'IN_PROGRESS'] }, eventTime: { gt: new Date() } },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, level: true, trustScore: true },
        },
        _count: { select: { groupMembers: { where: { status: 'JOINED' } }, expenses: true } },
      },
      orderBy: { eventTime: 'asc' },
    });

    const publicPlans = plans.map(({ latitude: _latitude, longitude: _longitude, ...plan }) => plan);
    return NextResponse.json({ plans: publicPlans });
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

    const { title, description, locationName, eventTime, capacity, budget, purpose, vibeTags } = await request.json();
    const parsedEventTime = new Date(eventTime);
    const parsedCapacity = Number(capacity || 6);
    const parsedBudget = budget === '' || budget === null || budget === undefined ? null : Number(budget);
    const validPurposes = ['Hangout', 'Food', 'Gaming', 'Study', 'Movie', 'Activity', 'Networking', 'Event', 'Dating', 'Other'];
    if (typeof title !== 'string' || !title.trim() || typeof description !== 'string' || !description.trim() || !Number.isFinite(parsedEventTime.getTime()) || parsedEventTime <= new Date() || !Number.isInteger(parsedCapacity) || parsedCapacity < 2 || parsedCapacity > 50 || (parsedBudget !== null && (!Number.isFinite(parsedBudget) || parsedBudget < 0))) {
      return NextResponse.json({ error: 'Add a title, details, a future time, 2–50 places, and a valid budget.' }, { status: 400 });
    }
    const safePurpose = validPurposes.includes(purpose) ? purpose : 'Hangout';

    const plan = await prisma.plan.create({
      data: {
        creator: { connect: { id: session.id } },
        title: title.trim(),
        description: description.trim(),
        locationName: typeof locationName === 'string' ? locationName.trim().slice(0, 80) : 'Graphic Era Campus',
        latitude: 30.2687,
        longitude: 78.0076,
        eventTime: parsedEventTime,
        capacity: parsedCapacity,
        budget: parsedBudget,
        purpose: safePurpose,
        vibeTags: Array.isArray(vibeTags) ? JSON.stringify(vibeTags) : vibeTags || '[]',
        post: {
          create: {
            author: { connect: { id: session.id } },
            type: 'PLAN',
            title: title.trim(),
            description: description.trim(),
            category: safePurpose,
            areaName: typeof locationName === 'string' ? locationName.trim().slice(0, 80) : 'Graphic Era Campus',
            latitude: 30.2687,
            longitude: 78.0076,
            radiusKm: 2,
            capacity: parsedCapacity,
            expiresAt: parsedEventTime,
            tags: Array.isArray(vibeTags) ? JSON.stringify(vibeTags) : '[]',
          },
        },
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

    await prisma.chat.create({
      data: {
        planId: plan.id,
        type: 'GROUP',
        name: `${title} · group chat`,
        members: { create: [{ userId: session.id }] },
      },
    });

    await awardXP(session.id, 'CREATE_PLAN', 40, `Created group plan: ${title}`);

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}
