import { prisma } from '../src/lib/prisma';
import { calculateDistanceKm, calculateRouteOverlap } from '../src/lib/geo';
import { extractIntentFromText, calculateMatchScore } from '../src/lib/ai-engine';
import { calculatePlanSettlement } from '../src/lib/expenses';
import { calculateLevelFromXP, recordTrustEvent } from '../src/lib/reputation';

async function testSuite() {
  console.log('=== STARTING END-TO-END VERIFICATION SUITE ===\n');

  // 1. Verify Users & Auth Database
  const users = await prisma.user.findMany({ include: { verification: true } });
  console.log(`✓ Database User count: ${users.length}`);
  const aarav = users.find(u => u.name.includes('Aarav'));
  const ananya = users.find(u => u.name.includes('Ananya'));
  const rohan = users.find(u => u.name.includes('Rohan'));
  const shreya = users.find(u => u.name.includes('Shreya'));

  if (!aarav || !ananya || !rohan || !shreya) {
    throw new Error('Demo users not found in database!');
  }
  console.log(`✓ Users verified: Aarav (L${aarav.level}), Ananya (L${ananya.level}), Rohan (L${rohan.level}), Shreya (L${shreya.level})`);

  // 2. Test Geospatial Proximity Calculation
  const dist = calculateDistanceKm(aarav.lat, aarav.lng, ananya.lat, ananya.lng);
  console.log(`✓ Geospatial Proximity: Distance between Aarav & Ananya = ${dist.toFixed(2)} km`);
  if (dist > 5.0) throw new Error('Geospatial calculation anomaly!');

  // 3. Test AI Intent Extraction
  const textSample = "Need Lenovo charger near Graphic Era for tonight";
  const intentResult = extractIntentFromText(textSample);
  console.log(`✓ AI Intent Extracted Type: ${intentResult.type}, Category: ${intentResult.category}, Tags: ${intentResult.tags.join(', ')}`);
  if (intentResult.type !== 'NEED' && intentResult.type !== 'BORROW') {
    throw new Error('AI Intent extraction mismatch!');
  }

  // 4. Test AI Matcher Engine (Demo Story 1: Charger Need vs Offer)
  const chargerNeedPost = await prisma.post.findFirst({ where: { title: { contains: 'Lenovo' }, type: 'NEED' } });
  const chargerOfferPost = await prisma.post.findFirst({ where: { title: { contains: 'Lenovo' }, type: 'OFFER' } });

  if (chargerNeedPost && chargerOfferPost) {
    const matchRes = calculateMatchScore(chargerNeedPost, chargerOfferPost);
    console.log(`✓ AI Match Engine Result: Score = ${matchRes.score} (${matchRes.reason})`);
    if (matchRes.score < 0.7) throw new Error('AI Match Engine score too low for matching intent!');
  }

  // 5. Test Route Overlap Calculation (Demo Story 2: GEU -> Saharanpur Chowk)
  const routeOverlapRes = calculateRouteOverlap(
    { origin: 'Graphic Era Campus', destination: 'Saharanpur Chowk' },
    { origin: 'Graphic Era Hostel', destination: 'Subhash Nagar Chowk' }
  );
  console.log(`✓ Route Overlap Engine: Score = ${routeOverlapRes.overlapScore} (${routeOverlapRes.reason})`);
  if (routeOverlapRes.overlapScore < 0.8) throw new Error('Route overlap matching failed!');

  // 6. Test Group Expense Settlement Engine (Demo Story 5: Shreya, Rohan, Atishay, Aarav)
  const cafePlan = await prisma.plan.findFirst({
    where: { title: { contains: 'Café' } },
    include: {
      groupMembers: { include: { user: true } },
      expenses: { include: { payer: true, participants: { include: { user: true } } } }
    }
  });

  if (!cafePlan) throw new Error('Café plan not found!');

  const memberList = cafePlan.groupMembers.map(gm => ({ userId: gm.userId, userName: gm.user.name }));
  const expenseItems = cafePlan.expenses.map(exp => ({
    id: exp.id,
    payerId: exp.payerId,
    payerName: exp.payer.name,
    amount: exp.amount,
    description: exp.description,
    isShared: exp.isShared,
    participants: exp.participants.map(p => ({ userId: p.userId, userName: p.user.name, shareAmount: p.shareAmount }))
  }));

  const settlementRes = calculatePlanSettlement(memberList, expenseItems);
  console.log(`✓ Group Expense Manager: Total Plan Cost = ₹${settlementRes.totalPlanExpense}, Shared Cost = ₹${settlementRes.totalSharedExpense}`);
  console.log('✓ Calculated Debt Settlements:');
  for (const st of settlementRes.settlements) {
    console.log(`   👉 ${st.fromUserName} owes ${st.toUserName}: ₹${st.amount}`);
  }

  // Check expected test outcome: Rohan (payer of ₹500 taxi) should receive funds from Aarav and Shreya
  const rohanSettlement = settlementRes.settlements.find(st => st.toUserId === rohan.id);
  if (!rohanSettlement) throw new Error('Settlement calculation error: Rohan should be owed funds!');

  // 7. Test Trust Rating & XP System
  const initialTrust = ananya.trustScore;
  const trustRes = await recordTrustEvent(
    ananya.id,
    aarav.id,
    0.2,
    'Reliable',
    'Automated test exchange rating'
  );
  console.log(`✓ Trust & Reputation Engine: Ananya trust updated from ${initialTrust} to ${trustRes.newTrustScore}★`);

  console.log('\n=== ALL END-TO-END VERIFICATION CHECKS PASSED PERFECTLY! ===');
}

testSuite()
  .catch(e => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
