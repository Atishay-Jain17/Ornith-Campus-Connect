import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        verification: true,
        trustReceived: { select: { feedbackAttribute: true } },
        _count: {
          select: {
            posts: true,
            createdPlans: true,
            notifications: { where: { isRead: false } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        area: user.area,
        lat: user.lat,
        lng: user.lng,
        xp: user.xp,
        trustScore: user.trustScore,
        level: user.level,
        isVerified: user.isVerified,
        role: user.role,
        verification: user.verification,
        trustAttributes: Array.from(new Set(user.trustReceived.map((event) => event.feedbackAttribute.replaceAll('_', ' ')))),
        unreadNotificationsCount: user._count.notifications,
        postsCount: user._count.posts,
        plansCount: user._count.createdPlans,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}
