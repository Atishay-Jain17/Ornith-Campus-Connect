import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, name, area, bio } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        area: area || 'Graphic Era Area',
        bio: bio || 'Campus Community Member',
        lat: 30.2687,
        lng: 78.0076,
        xp: 100,
        trustScore: 5.0,
        level: 1,
        isVerified: true,
      },
    });

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
        level: user.level,
        trustScore: user.trustScore,
        xp: user.xp,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}
