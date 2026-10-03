import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: email || 'aarav@geu.ac.in' },
      include: { verification: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      level: user.level,
      isVerified: user.isVerified,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        level: user.level,
        trustScore: user.trustScore,
        xp: user.xp,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Demo switch error:', error);
    return NextResponse.json({ error: 'Failed to switch user' }, { status: 500 });
  }
}
