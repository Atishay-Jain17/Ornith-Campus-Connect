import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with demo network data...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.xPEvent.deleteMany();
  await prisma.trustEvent.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatUser.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.expenseParticipant.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.postInterest.deleteMany();
  await prisma.postMatch.deleteMany();
  await prisma.post.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Demo Users
  const userAarav = await prisma.user.create({
    data: {
      email: 'aarav@geu.ac.in',
      passwordHash,
      name: 'Aarav Sharma',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
      bio: 'B.Tech CSE 3rd Year @ Graphic Era. Tech enthusiast & night owl.',
      area: 'Graphic Era Main Campus',
      lat: 30.2687,
      lng: 78.0076,
      xp: 1250,
      trustScore: 4.9,
      level: 5, // Trusted (Level 5 - can post opportunities)
      isVerified: true,
      role: 'USER',
      verification: {
        create: {
          studentId: 'GEU/2023/10492',
          department: 'Computer Science',
          campusName: 'Graphic Era University',
          status: 'VERIFIED'
        }
      }
    }
  });

  const userAnanya = await prisma.user.create({
    data: {
      email: 'ananya@geu.ac.in',
      passwordHash,
      name: 'Ananya Roy',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
      bio: 'Design lead & gadget collector. Always ready to lend tech gear!',
      area: 'Clement Town / GEU Gate 2',
      lat: 30.2695,
      lng: 78.0090,
      xp: 850,
      trustScore: 4.8,
      level: 3, // Regular
      isVerified: true,
      role: 'USER',
      verification: {
        create: {
          studentId: 'GEU/2023/8821',
          department: 'Media & Design',
          campusName: 'Graphic Era University',
          status: 'VERIFIED'
        }
      }
    }
  });

  const userRohan = await prisma.user.create({
    data: {
      email: 'rohan@geu.ac.in',
      passwordHash,
      name: 'Rohan Verma',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
      bio: 'Daily commuter from Saharanpur Chowk. Carpool buddy!',
      area: 'Subhash Nagar, Dehradun',
      lat: 30.2750,
      lng: 78.0120,
      xp: 420,
      trustScore: 4.6,
      level: 2, // Local
      isVerified: true,
      role: 'USER',
      verification: {
        create: {
          studentId: 'GEU/2024/3391',
          department: 'Mechanical Eng',
          campusName: 'Graphic Era University',
          status: 'VERIFIED'
        }
      }
    }
  });

  const userShreya = await prisma.user.create({
    data: {
      email: 'shreya@geu.ac.in',
      passwordHash,
      name: 'Shreya Gupta',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shreya',
      bio: 'Foodie, crocheter, traveler. Always up for group outings!',
      area: 'Graphic Era Hostel Complex',
      lat: 30.2670,
      lng: 78.0060,
      xp: 610,
      trustScore: 4.7,
      level: 3,
      isVerified: true,
      role: 'USER'
    }
  });

  const userAtishay = await prisma.user.create({
    data: {
      email: 'atishay@geu.ac.in',
      passwordHash,
      name: 'Atishay Patel',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Atishay',
      bio: 'Competitive coder & problem solver. Let us build cool stuff.',
      area: 'Clement Town Market',
      lat: 30.2700,
      lng: 78.0050,
      xp: 1500,
      trustScore: 5.0,
      level: 6, // Connector
      isVerified: true,
      role: 'USER'
    }
  });

  console.log('Users created: Aarav, Ananya, Rohan, Shreya, Atishay');

  // 2. Create Core Posts/Intents (Demo Story 1: Charger Need vs Offer)
  const postChargerNeed = await prisma.post.create({
    data: {
      authorId: userAarav.id,
      type: 'NEED',
      title: 'Need Lenovo 65W Laptop Charger for tonight',
      description: 'Working on final project submission due tomorrow morning. Need a Type-C / Slim tip Lenovo charger near GEU campus for 4-5 hours!',
      category: 'Electronics / Help',
      latitude: 30.2687,
      longitude: 78.0076,
      areaName: 'Graphic Era Main Campus',
      radiusKm: 2.0,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 12 * 3600 * 1000), // 12 hours from now
      tags: JSON.stringify(['lenovo', 'charger', 'urgent', 'laptop']),
      contributionMode: 'FREE'
    }
  });

  const postChargerOffer = await prisma.post.create({
    data: {
      authorId: userAnanya.id,
      type: 'OFFER',
      title: 'Can lend Lenovo 65W Type-C Charger',
      description: 'Have a spare Lenovo laptop charger at my room near GEU Gate 2. Happy to lend it for the evening/night.',
      category: 'Electronics / Lend',
      latitude: 30.2695,
      longitude: 78.0090,
      areaName: 'Clement Town / GEU Gate 2',
      radiusKm: 3.0,
      status: 'ACTIVE',
      tags: JSON.stringify(['lenovo', 'charger', 'lend', 'electronics']),
      contributionMode: 'FREE'
    }
  });

  // Store Match between Charger Need & Offer
  await prisma.postMatch.create({
    data: {
      postId: postChargerNeed.id,
      targetPostId: postChargerOffer.id,
      matchedUserId: userAnanya.id,
      matchScore: 0.96,
      matchReason: 'High intent similarity: Need Lenovo charger matched with Offer Lenovo 65W charger (Dist: ~0.15 km)'
    }
  });

  // Demo Story 2: Route / Ride Matching
  const postRide = await prisma.post.create({
    data: {
      authorId: userRohan.id,
      type: 'RIDE',
      title: 'Graphic Era -> Saharanpur Chowk at 5:00 PM',
      description: 'Driving my car to Saharanpur Chowk via Subhash Nagar. 2 seats available for fellow campus folks.',
      category: 'Travel / Ride',
      latitude: 30.2687,
      longitude: 78.0076,
      areaName: 'Graphic Era Main Campus',
      radiusKm: 10.0,
      routeOrigin: 'Graphic Era Campus',
      routeDestination: 'Saharanpur Chowk',
      departureTime: new Date(Date.now() + 4 * 3600 * 1000),
      capacity: 2,
      price: 30,
      contributionMode: 'FIXED',
      status: 'ACTIVE',
      tags: JSON.stringify(['carpool', 'ride', 'saharanpur_chowk', 'geu'])
    }
  });

  const postRideNeed = await prisma.post.create({
    data: {
      authorId: userShreya.id,
      type: 'NEED',
      title: 'Looking for ride towards Subhash Nagar / Saharanpur Chowk',
      description: 'Need a ride around 5 PM from GEU Gate 1 towards Subhash Nagar Chowk.',
      category: 'Travel / Ride',
      latitude: 30.2670,
      longitude: 78.0060,
      areaName: 'Graphic Era Hostel Complex',
      radiusKm: 5.0,
      routeOrigin: 'Graphic Era Hostel',
      routeDestination: 'Subhash Nagar Chowk',
      status: 'ACTIVE',
      tags: JSON.stringify(['ride', 'carpool', 'subhash_nagar'])
    }
  });

  await prisma.postMatch.create({
    data: {
      postId: postRide.id,
      targetPostId: postRideNeed.id,
      matchedUserId: userShreya.id,
      matchScore: 0.92,
      matchReason: 'Route Overlap: 85% path overlap along GEU -> Subhash Nagar -> Saharanpur Chowk at 5:00 PM'
    }
  });

  // Demo Story 3: Marketplace & Service Posts
  await prisma.post.create({
    data: {
      authorId: userAnanya.id,
      type: 'SERVICE',
      title: 'Poster & PPT Design for Campus Clubs / Projects',
      description: 'Figma & Photoshop expert. Can design modern slides, presentation decks, or event posters.',
      category: 'Services',
      latitude: 30.2695,
      longitude: 78.0090,
      areaName: 'GEU Gate 2',
      radiusKm: 5.0,
      price: 250,
      contributionMode: 'FIXED',
      status: 'ACTIVE',
      tags: JSON.stringify(['design', 'ppt', 'poster', 'freelance'])
    }
  });

  await prisma.post.create({
    data: {
      authorId: userAtishay.id,
      type: 'GIVE',
      title: 'Giving away Mechanical Keyboard (Blue Switches)',
      description: 'Upgraded to a silent keyboard. Old keyboard works great, giving away for free to anyone who needs it for coding!',
      category: 'Electronics / Give',
      latitude: 30.2700,
      longitude: 78.0050,
      areaName: 'Clement Town Market',
      radiusKm: 2.0,
      status: 'ACTIVE',
      tags: JSON.stringify(['giveaway', 'keyboard', 'free', 'electronics'])
    }
  });

  // Demo Story 4: Opportunity with AI Risk Indicator check
  const postOpportunity = await prisma.post.create({
    data: {
      authorId: userAarav.id, // Level 5 user (Allowed to post opportunity)
      type: 'OPPORTUNITY',
      title: 'Frontend Developer Intern (React/Next.js) - Local Dehradun Startup',
      description: 'Looking for a student intern to help build UI components for a stealth project. ₹8,000/month stipend. Verified campus startup.',
      category: 'Internship',
      latitude: 30.2687,
      longitude: 78.0076,
      areaName: 'Graphic Era Tech Park',
      radiusKm: 10.0,
      status: 'ACTIVE',
      riskIndicators: JSON.stringify(['Verified Level 5 Creator', 'Stipend details provided', 'No deposit required']),
      tags: JSON.stringify(['internship', 'react', 'nextjs', 'paid'])
    }
  });

  // 3. Create Plan with Group & Expenses (Demo Story 5: Plan + Expense Settlement)
  const cafePlan = await prisma.plan.create({
    data: {
      creatorId: userAarav.id,
      title: 'Weekend Café Hangout & Pizza Party',
      description: 'Gathering at Out of Oven Café near Clement Town for pizza, code chatter, and card games!',
      locationName: 'Out of Oven Café, Clement Town',
      latitude: 30.2690,
      longitude: 78.0080,
      eventTime: new Date(Date.now() + 24 * 3600 * 1000), // Tomorrow
      capacity: 6,
      budget: 300,
      purpose: 'Food',
      vibeTags: JSON.stringify(['Casual', 'Pizza', 'Games', 'Chai']),
      status: 'UPCOMING'
    }
  });

  // Add Group Members
  await prisma.groupMember.createMany({
    data: [
      { planId: cafePlan.id, userId: userAarav.id, role: 'HOST', status: 'JOINED' },
      { planId: cafePlan.id, userId: userShreya.id, role: 'MEMBER', status: 'JOINED' },
      { planId: cafePlan.id, userId: userRohan.id, role: 'MEMBER', status: 'JOINED' },
      { planId: cafePlan.id, userId: userAtishay.id, role: 'MEMBER', status: 'JOINED' }
    ]
  });

  // Create Expenses as per PDF spec:
  // - Shreya pays ₹100 for ice cream — shared (Shreya, Rohan, Atishay, Aarav => ₹25 each)
  // - Rohan (Rahul equivalent) pays ₹500 taxi — shared (Shreya, Rohan, Atishay, Aarav => ₹125 each)
  // - Atishay pays ₹200 amenities — shared (Shreya, Rohan, Atishay, Aarav => ₹50 each)
  // - Shreya buys ₹200 crochet — personal (Shreya only)

  const exp1 = await prisma.expense.create({
    data: {
      planId: cafePlan.id,
      payerId: userShreya.id,
      amount: 100,
      description: 'Ice Cream Cup Platters',
      isShared: true
    }
  });
  await prisma.expenseParticipant.createMany({
    data: [
      { expenseId: exp1.id, userId: userShreya.id, shareAmount: 25 },
      { expenseId: exp1.id, userId: userRohan.id, shareAmount: 25 },
      { expenseId: exp1.id, userId: userAtishay.id, shareAmount: 25 },
      { expenseId: exp1.id, userId: userAarav.id, shareAmount: 25 }
    ]
  });

  const exp2 = await prisma.expense.create({
    data: {
      planId: cafePlan.id,
      payerId: userRohan.id,
      amount: 500,
      description: 'Shared Taxi Fare to Clement Town',
      isShared: true
    }
  });
  await prisma.expenseParticipant.createMany({
    data: [
      { expenseId: exp2.id, userId: userShreya.id, shareAmount: 125 },
      { expenseId: exp2.id, userId: userRohan.id, shareAmount: 125 },
      { expenseId: exp2.id, userId: userAtishay.id, shareAmount: 125 },
      { expenseId: exp2.id, userId: userAarav.id, shareAmount: 125 }
    ]
  });

  const exp3 = await prisma.expense.create({
    data: {
      planId: cafePlan.id,
      payerId: userAtishay.id,
      amount: 200,
      description: 'Café Board Game & Amenities Fee',
      isShared: true
    }
  });
  await prisma.expenseParticipant.createMany({
    data: [
      { expenseId: exp3.id, userId: userShreya.id, shareAmount: 50 },
      { expenseId: exp3.id, userId: userRohan.id, shareAmount: 50 },
      { expenseId: exp3.id, userId: userAtishay.id, shareAmount: 50 },
      { expenseId: exp3.id, userId: userAarav.id, shareAmount: 50 }
    ]
  });

  const exp4 = await prisma.expense.create({
    data: {
      planId: cafePlan.id,
      payerId: userShreya.id,
      amount: 200,
      description: 'Crochet Kit Purchase (Personal)',
      isShared: false
    }
  });
  await prisma.expenseParticipant.create({
    data: {
      expenseId: exp4.id,
      userId: userShreya.id,
      shareAmount: 200
    }
  });

  // Calculate settlement balances:
  // Aarav total share = 25 + 125 + 50 = 200. Paid = 0. Owes 200.
  // Rohan total share = 25 + 125 + 50 = 200. Paid = 500. Receivable = +300.
  // Atishay total share = 25 + 125 + 50 = 200. Paid = 200. Net = 0.
  // Shreya total share = 25 + 125 + 50 + 200 (personal) = 400. Paid = 100 + 200 = 300. Owes 100 (net shared share 200, paid shared 100 -> owes 100).
  // So Aarav owes Rohan 200, Shreya owes Rohan 100.

  await prisma.settlement.createMany({
    data: [
      {
        planId: cafePlan.id,
        fromUserId: userAarav.id,
        toUserId: userRohan.id,
        amount: 200,
        status: 'PENDING'
      },
      {
        planId: cafePlan.id,
        fromUserId: userShreya.id,
        toUserId: userRohan.id,
        amount: 100,
        status: 'PENDING'
      }
    ]
  });

  console.log('Expenses and settlements generated for Café Plan!');

  // 4. Create Chat & Messages
  const chargerChat = await prisma.chat.create({
    data: {
      postId: postChargerNeed.id,
      type: 'DIRECT',
      name: 'Aarav & Ananya - Lenovo Charger Exchange',
      members: {
        create: [
          { userId: userAarav.id },
          { userId: userAnanya.id }
        ]
      }
    }
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        chatId: chargerChat.id,
        senderId: userAnanya.id,
        text: 'Hey Aarav! I saw your post. I have a 65W Type-C Lenovo charger you can borrow for tonight.'
      },
      {
        chatId: chargerChat.id,
        senderId: userAarav.id,
        text: 'That is awesome Ananya! Where can I meet you near campus?'
      },
      {
        chatId: chargerChat.id,
        senderId: userAnanya.id,
        text: 'Let us meet at the GEU Gate 2 Security Booth in 15 mins. Safe public spot!'
      }
    ]
  });

  // 5. Create XP & Trust Events
  await prisma.xPEvent.createMany({
    data: [
      {
        userId: userAarav.id,
        actionType: 'CREATE_POST',
        xpGained: 50,
        description: 'Posted urgent laptop charger need in campus network'
      },
      {
        userId: userAnanya.id,
        actionType: 'HELP_NEIGHBOR',
        xpGained: 150,
        description: 'Offered charger assistance to fellow student'
      }
    ]
  });

  await prisma.trustEvent.createMany({
    data: [
      {
        targetUserId: userAnanya.id,
        raterUserId: userAarav.id,
        scoreChange: 0.2,
        feedbackAttribute: 'Helpful',
        note: 'Prompt response and offered charger instantly when I was stuck on my project!'
      },
      {
        targetUserId: userRohan.id,
        raterUserId: userShreya.id,
        scoreChange: 0.15,
        feedbackAttribute: 'On_time',
        note: 'Super reliable ride share, reached right at 5:00 PM.'
      }
    ]
  });

  // 6. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: userAarav.id,
        title: 'Nearby Match Found! ⚡',
        message: 'Ananya Roy has a Lenovo 65W charger available near GEU Gate 2.',
        link: `/chat/${chargerChat.id}`,
        type: 'MATCH'
      },
      {
        userId: userShreya.id,
        title: 'Settlement Summary Updated 💰',
        message: 'New shared taxi expense added to Weekend Café Hangout.',
        link: `/plans/${cafePlan.id}`,
        type: 'EXPENSE'
      }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
