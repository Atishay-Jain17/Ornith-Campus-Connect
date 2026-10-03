import { prisma } from './prisma';

export const LEVEL_TITLES: { [level: number]: string } = {
  1: 'Newcomer',
  2: 'Local',
  3: 'Regular',
  4: 'Helper',
  5: 'Trusted', // Gated for posting Opportunities
  6: 'Connector',
  7: 'Community Pillar',
};

export const LEVEL_THRESHOLDS: { [level: number]: number } = {
  1: 0,
  2: 200,
  3: 500,
  4: 1000,
  5: 1500,
  6: 2500,
  7: 4000,
};

export function calculateLevelFromXP(xp: number): number {
  if (xp >= 4000) return 7;
  if (xp >= 2500) return 6;
  if (xp >= 1500) return 5;
  if (xp >= 1000) return 4;
  if (xp >= 500) return 3;
  if (xp >= 200) return 2;
  return 1;
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[level] || 'Member';
}

/**
 * Award XP to a user and handle level upgrades automatically
 */
export async function awardXP(
  userId: string,
  actionType: string,
  xpGained: number,
  description: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const newXP = user.xp + xpGained;
  const newLevel = calculateLevelFromXP(newXP);
  const levelUp = newLevel > user.level;

  await prisma.$transaction([
    prisma.xPEvent.create({
      data: {
        userId,
        actionType,
        xpGained,
        description,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXP,
        level: newLevel,
      },
    }),
  ]);

  if (levelUp) {
    await prisma.notification.create({
      data: {
        userId,
        title: '🎉 Level Up!',
        message: `Congratulations! You reached Level ${newLevel} (${getLevelTitle(newLevel)}). ${
          newLevel >= 5 ? 'Opportunity posting is now unlocked for your account!' : ''
        }`,
        type: 'XP',
        link: '/profile',
      },
    });
  }

  return { newXP, newLevel, levelUp };
}

/**
 * Record a Trust rating event and re-calculate trust score
 */
export async function recordTrustEvent(
  targetUserId: string,
  raterUserId: string,
  scoreChange: number,
  feedbackAttribute: 'Reliable' | 'Helpful' | 'On_time' | 'Honest' | 'Good_communicator',
  note?: string,
  postId?: string
) {
  const trustEvent = await prisma.trustEvent.create({
    data: {
      targetUserId,
      raterUserId,
      scoreChange,
      feedbackAttribute,
      note,
      postId,
    },
  });

  // Calculate new average trust score
  const allEvents = await prisma.trustEvent.findMany({
    where: { targetUserId },
  });

  const totalChange = allEvents.reduce((acc, curr) => acc + curr.scoreChange, 0);
  const baseScore = 4.5;
  const newTrustScore = Math.min(5.0, Math.max(1.0, Math.round((baseScore + totalChange) * 10) / 10));

  await prisma.user.update({
    where: { id: targetUserId },
    data: { trustScore: newTrustScore },
  });

  // Also award XP to rater and target for completing trust feedback
  await awardXP(targetUserId, 'EXCHANGE_COMPLETED', 100, `Completed exchange with feedback (${feedbackAttribute})`);
  await awardXP(raterUserId, 'FEEDBACK_PROVIDED', 30, 'Provided trust feedback for peer');

  await prisma.notification.create({
    data: {
      userId: targetUserId,
      title: '⭐ New Trust Rating Received',
      message: `A peer rated you as "${feedbackAttribute}"! Your trust score is now ${newTrustScore}★`,
      type: 'TRUST',
      link: '/profile',
    },
  });

  return { trustEvent, newTrustScore };
}
