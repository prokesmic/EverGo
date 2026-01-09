import { PrismaClient, ChallengeTarget, ChallengeScope, BadgeCategory, BadgeCriteria, BadgeRarity } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAdminData() {
  console.log('🌱 Seeding admin user synthetic data...')

  // Find admin user
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@evergo.app' }
  })

  if (!admin) {
    console.log('❌ Admin user not found. Please create admin@evergo.app first.')
    return
  }

  console.log(`✅ Found admin user: ${admin.displayName} (${admin.id})`)

  // Get sports
  const running = await prisma.sport.findUnique({
    where: { slug: 'running' },
    include: { disciplines: true }
  })
  const cycling = await prisma.sport.findUnique({
    where: { slug: 'cycling' },
    include: { disciplines: true }
  })
  const swimming = await prisma.sport.findUnique({
    where: { slug: 'swimming' },
    include: { disciplines: true }
  })

  if (!running || !cycling) {
    console.log('❌ Required sports not found. Run seed-sports first.')
    return
  }

  const roadRunning = running.disciplines.find(d => d.slug === '5k') || running.disciplines[0]
  const roadCycling = cycling.disciplines.find(d => d.slug === 'road') || cycling.disciplines[0]

  // ==========================================
  // 1. CREATE COMPETITOR USERS FOR RANKINGS
  // ==========================================
  console.log('\n📊 Creating competitors for rankings...')

  const competitorData = [
    { username: 'alex_champion', displayName: 'Alex Thompson', city: 'Prague', sportIndex: 890, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200' },
    { username: 'maria_swift', displayName: 'Maria Garcia', city: 'Prague', sportIndex: 845, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200' },
    { username: 'james_runner', displayName: 'James Wilson', city: 'Prague', sportIndex: 812, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200' },
    { username: 'sofia_cyclist', displayName: 'Sofia Novak', city: 'Brno', sportIndex: 785, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200' },
    { username: 'mike_power', displayName: 'Mike Roberts', city: 'Prague', sportIndex: 756, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200' },
    { username: 'emma_endurance', displayName: 'Emma Chen', city: 'Prague', sportIndex: 732, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200' },
    { username: 'lucas_fast', displayName: 'Lucas Brown', city: 'Ostrava', sportIndex: 698, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200' },
    { username: 'anna_fit', displayName: 'Anna Kowalski', city: 'Prague', sportIndex: 678, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200' },
    { username: 'david_speed', displayName: 'David Kim', city: 'Prague', sportIndex: 645, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200' },
    { username: 'lisa_strong', displayName: 'Lisa Martinez', city: 'Brno', sportIndex: 612, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200' },
  ]

  const competitors: any[] = []

  for (const comp of competitorData) {
    const user = await prisma.user.upsert({
      where: { username: comp.username },
      update: {},
      create: {
        email: `${comp.username}@example.com`,
        username: comp.username,
        displayName: comp.displayName,
        password: '$2b$10$qFIDrs0QO/v.ZSr25beAkepFGVKU8C8l19ZG4uMiJRRB3VaO1crJC',
        avatarUrl: comp.avatar,
        city: comp.city,
        country: 'Czech Republic',
        bio: `Passionate athlete from ${comp.city}`,
      }
    })

    // Create/update UserStats
    await prisma.userStats.upsert({
      where: { userId: user.id },
      update: {
        sportIndex: comp.sportIndex,
        sportIndexBest: comp.sportIndex + 20,
        totalDistance: 500 + Math.random() * 2000,
        totalDuration: Math.round((50 + Math.random() * 200) * 3600),
        totalActivities: Math.round(30 + Math.random() * 150),
        city: comp.city,
        country: 'Czech Republic',
      },
      create: {
        userId: user.id,
        sportIndex: comp.sportIndex,
        sportIndexBest: comp.sportIndex + 20,
        totalDistance: 500 + Math.random() * 2000,
        totalDuration: Math.round((50 + Math.random() * 200) * 3600),
        totalActivities: Math.round(30 + Math.random() * 150),
        city: comp.city,
        country: 'Czech Republic',
      }
    })

    // Create activities for this competitor
    const today = new Date()
    for (let i = 0; i < 15; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i * 2)

      if (Math.random() > 0.3) {
        const isRun = Math.random() > 0.4
        const discipline = isRun ? roadRunning : roadCycling

        if (discipline) {
          const duration = 1800 + Math.random() * 5400
          const speedKmh = isRun ? (10 + Math.random() * 4) : (22 + Math.random() * 12)
          const distance = (duration / 3600) * speedKmh * 1000

          await prisma.activity.create({
            data: {
              userId: user.id,
              disciplineId: discipline.id,
              title: isRun ? `${['Morning', 'Afternoon', 'Evening'][Math.floor(Math.random() * 3)]} Run` : `Cycling Session`,
              activityDate: date,
              durationSeconds: Math.round(duration),
              distanceMeters: Math.round(distance),
              caloriesBurned: Math.round(duration * (isRun ? 0.2 : 0.15)),
              avgPace: isRun ? (1000 / (speedKmh / 3.6)) : undefined,
              avgSpeed: !isRun ? speedKmh : undefined,
              primaryValue: Math.round(duration),
              photos: '[]',
              visibility: 'PUBLIC'
            }
          })
        }
      }
    }

    competitors.push(user)
    console.log(`  ✓ Created competitor: ${comp.displayName} (SI: ${comp.sportIndex})`)
  }

  // ==========================================
  // 2. SET ADMIN USER STATS (Top 5 globally)
  // ==========================================
  console.log('\n🏆 Setting admin user stats...')

  await prisma.userStats.upsert({
    where: { userId: admin.id },
    update: {
      sportIndex: 742,
      sportIndexBest: 780,
      totalDistance: 1250.5,
      totalDuration: 180 * 3600,
      totalActivities: 156,
      totalCalories: 95000,
      globalRank: 5,
      countryRank: 3,
      cityRank: 2,
      city: admin.city || 'Prague',
      country: 'Czech Republic',
    },
    create: {
      userId: admin.id,
      sportIndex: 742,
      sportIndexBest: 780,
      totalDistance: 1250.5,
      totalDuration: 180 * 3600,
      totalActivities: 156,
      totalCalories: 95000,
      globalRank: 5,
      countryRank: 3,
      cityRank: 2,
      city: admin.city || 'Prague',
      country: 'Czech Republic',
    }
  })

  // Create admin activities for the last 30 days
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Admin trains most days
    if (Math.random() > 0.2) {
      const isRun = Math.random() > 0.35
      const discipline = isRun ? roadRunning : roadCycling

      if (discipline) {
        const duration = 2400 + Math.random() * 4800
        const speedKmh = isRun ? (11 + Math.random() * 3) : (25 + Math.random() * 10)
        const distance = (duration / 3600) * speedKmh * 1000

        await prisma.activity.create({
          data: {
            userId: admin.id,
            disciplineId: discipline.id,
            title: isRun
              ? `${['Morning', 'Tempo', 'Recovery', 'Long'][Math.floor(Math.random() * 4)]} Run`
              : `${['Hill', 'Interval', 'Endurance', 'Recovery'][Math.floor(Math.random() * 4)]} Ride`,
            description: Math.random() > 0.5 ? 'Great session today!' : undefined,
            activityDate: date,
            durationSeconds: Math.round(duration),
            distanceMeters: Math.round(distance),
            caloriesBurned: Math.round(duration * (isRun ? 0.22 : 0.16)),
            avgPace: isRun ? (1000 / (speedKmh / 3.6)) : undefined,
            avgSpeed: !isRun ? speedKmh : undefined,
            primaryValue: Math.round(duration),
            photos: '[]',
            visibility: 'PUBLIC'
          }
        })
      }
    }
  }
  console.log('  ✓ Admin stats and activities created')

  // ==========================================
  // 3. CREATE TEAMS
  // ==========================================
  console.log('\n👥 Creating teams...')

  const teamsData = [
    {
      name: 'Prague Runners Elite',
      slug: 'prague-runners-elite',
      sport: running,
      description: 'The top running club in Prague. Join us for weekly group runs and competitions.',
      city: 'Prague',
      memberCount: 47,
    },
    {
      name: 'Czech Cycling Club',
      slug: 'czech-cycling-club',
      sport: cycling,
      description: 'Passionate cyclists exploring the roads of Czech Republic.',
      city: 'Prague',
      memberCount: 32,
    },
    {
      name: 'Brno Endurance Team',
      slug: 'brno-endurance',
      sport: running,
      description: 'Multi-sport endurance athletes from Brno.',
      city: 'Brno',
      memberCount: 24,
    },
  ]

  const teams: any[] = []
  for (const teamData of teamsData) {
    const team = await prisma.team.upsert({
      where: { slug: teamData.slug },
      update: {},
      create: {
        name: teamData.name,
        slug: teamData.slug,
        description: teamData.description,
        sportId: teamData.sport!.id,
        city: teamData.city,
        country: 'Czech Republic',
        teamType: 'CLUB',
        isPublic: true,
        memberCount: teamData.memberCount,
        totalDistance: 5000 + Math.random() * 10000,
        totalActivities: 200 + Math.floor(Math.random() * 500),
        avgSportIndex: 650 + Math.floor(Math.random() * 150),
        globalRank: Math.floor(Math.random() * 100) + 1,
      }
    })

    // Add admin as member (ADMIN role for first team, MEMBER for others)
    await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId: team.id, userId: admin.id } },
      update: {},
      create: {
        teamId: team.id,
        userId: admin.id,
        role: teams.length === 0 ? 'ADMIN' : 'MEMBER',
      }
    }).catch(() => {
      // Ignore if exists
    })

    // Add some competitors as members
    for (let i = 0; i < Math.min(5, competitors.length); i++) {
      if (Math.random() > 0.3) {
        await prisma.teamMember.upsert({
          where: { teamId_userId: { teamId: team.id, userId: competitors[i].id } },
          update: {},
          create: {
            teamId: team.id,
            userId: competitors[i].id,
            role: 'MEMBER',
          }
        }).catch(() => {})
      }
    }

    teams.push(team)
    console.log(`  ✓ Created team: ${teamData.name}`)
  }

  // ==========================================
  // 4. CREATE CHALLENGES
  // ==========================================
  console.log('\n🎯 Creating challenges...')

  // First create badges for challenges
  const challengeBadges = [
    {
      name: 'Winter Warrior',
      description: 'Complete the Winter 100km Challenge',
      iconUrl: '❄️',
      color: '#38BDF8',
      category: BadgeCategory.CHALLENGE,
      criteriaType: BadgeCriteria.TOTAL_DISTANCE,
      criteriaValue: 100,
      rarity: BadgeRarity.RARE,
    },
    {
      name: 'Speed Demon',
      description: 'Complete 20 workouts in December',
      iconUrl: '⚡',
      color: '#F97316',
      category: BadgeCategory.CHALLENGE,
      criteriaType: BadgeCriteria.TOTAL_ACTIVITIES,
      criteriaValue: 20,
      rarity: BadgeRarity.UNCOMMON,
    },
    {
      name: 'Endurance King',
      description: 'Log 50 hours of training',
      iconUrl: '👑',
      color: '#EAB308',
      category: BadgeCategory.CHALLENGE,
      criteriaType: BadgeCriteria.TOTAL_DISTANCE,
      criteriaValue: 50,
      rarity: BadgeRarity.EPIC,
    },
  ]

  const badges: any[] = []
  for (const badgeData of challengeBadges) {
    const badge = await prisma.badge.upsert({
      where: { id: `badge_${badgeData.name.toLowerCase().replace(/\s/g, '_')}` },
      update: {},
      create: {
        id: `badge_${badgeData.name.toLowerCase().replace(/\s/g, '_')}`,
        ...badgeData,
      }
    })
    badges.push(badge)
  }

  const challengesData = [
    {
      title: 'Winter 100km Challenge',
      description: 'Run or cycle 100km this winter to earn the Winter Warrior badge. Any activity counts!',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-31'),
      targetType: ChallengeTarget.DISTANCE,
      targetValue: 100,
      targetUnit: 'km',
      scope: ChallengeScope.GLOBAL,
      badgeId: badges[0]?.id,
      sponsorName: 'Nike',
      sponsorLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/200px-Logo_NIKE.svg.png',
      sponsorReward: '15% off winter gear',
    },
    {
      title: 'December Activity Blitz',
      description: 'Complete 20 workouts in December. Stay consistent and build your habit!',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-31'),
      targetType: ChallengeTarget.ACTIVITIES,
      targetValue: 20,
      targetUnit: 'workouts',
      scope: ChallengeScope.GLOBAL,
      badgeId: badges[1]?.id,
    },
    {
      title: '50 Hour Endurance Challenge',
      description: 'Log 50 hours of training this month. Push your limits!',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-31'),
      targetType: ChallengeTarget.DURATION,
      targetValue: 50 * 60, // 50 hours in minutes
      targetUnit: 'minutes',
      scope: ChallengeScope.GLOBAL,
      badgeId: badges[2]?.id,
    },
    {
      title: 'Prague Runners Weekly Challenge',
      description: 'Run 30km this week with Prague Runners Elite!',
      startDate: new Date('2025-12-09'),
      endDate: new Date('2025-12-15'),
      targetType: ChallengeTarget.DISTANCE,
      targetValue: 30,
      targetUnit: 'km',
      scope: ChallengeScope.TEAM,
      teamId: teams[0]?.id,
      sportId: running.id,
    },
    {
      title: 'New Year 7-Day Streak',
      description: 'Start the new year with 7 consecutive days of activity!',
      startDate: new Date('2025-12-26'),
      endDate: new Date('2026-01-07'),
      targetType: ChallengeTarget.STREAK,
      targetValue: 7,
      targetUnit: 'days',
      scope: ChallengeScope.GLOBAL,
    },
  ]

  const challenges: any[] = []
  for (const challengeData of challengesData) {
    const challenge = await prisma.challenge.create({
      data: {
        ...challengeData,
        isActive: true,
      }
    })

    // Add admin as participant with progress
    const adminProgress = challengeData.targetValue * (0.3 + Math.random() * 0.5)
    await prisma.challengeParticipant.create({
      data: {
        challengeId: challenge.id,
        userId: admin.id,
        currentValue: adminProgress,
        isCompleted: adminProgress >= challengeData.targetValue,
        completedAt: adminProgress >= challengeData.targetValue ? new Date() : undefined,
        rank: Math.floor(Math.random() * 10) + 1,
      }
    })

    // Add some competitors as participants
    for (let i = 0; i < Math.min(8, competitors.length); i++) {
      if (Math.random() > 0.2) {
        const progress = challengeData.targetValue * Math.random()
        await prisma.challengeParticipant.create({
          data: {
            challengeId: challenge.id,
            userId: competitors[i].id,
            currentValue: progress,
            isCompleted: progress >= challengeData.targetValue,
            completedAt: progress >= challengeData.targetValue ? new Date() : undefined,
            rank: Math.floor(Math.random() * 50) + 1,
          }
        }).catch(() => {})
      }
    }

    challenges.push(challenge)
    console.log(`  ✓ Created challenge: ${challengeData.title}`)
  }

  // Partner requests removed in V6
  console.log('\n📅 Partner requests removed in V6 - skipping...')

  // ==========================================
  // 6. CREATE USER STREAK
  // ==========================================
  console.log('\n🔥 Creating user streak...')

  await prisma.userStreak.upsert({
    where: { userId: admin.id },
    update: {
      currentStreak: 14,
      longestStreak: 28,
      lastActivityDate: new Date(),
      weeklyStreak: 8,
      weeklyGoal: 4,
      weeklyProgress: 3,
      weekStartDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    create: {
      userId: admin.id,
      currentStreak: 14,
      longestStreak: 28,
      lastActivityDate: new Date(),
      weeklyStreak: 8,
      weeklyGoal: 4,
      weeklyProgress: 3,
      weekStartDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    }
  })
  console.log('  ✓ User streak created')

  // ==========================================
  // 7. ADD FOLLOWS (Social connections)
  // ==========================================
  console.log('\n👋 Creating social connections...')

  // Admin follows some competitors
  for (let i = 0; i < Math.min(6, competitors.length); i++) {
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: admin.id, followingId: competitors[i].id } },
      update: {},
      create: {
        followerId: admin.id,
        followingId: competitors[i].id,
      }
    }).catch(() => {})
  }

  // Some competitors follow admin
  for (let i = 0; i < Math.min(8, competitors.length); i++) {
    if (Math.random() > 0.3) {
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: competitors[i].id, followingId: admin.id } },
        update: {},
        create: {
          followerId: competitors[i].id,
          followingId: admin.id,
        }
      }).catch(() => {})
    }
  }
  console.log('  ✓ Social connections created')

  // ==========================================
  // 8. UPDATE RANKING CACHE
  // ==========================================
  console.log('\n📈 Updating ranking cache...')

  // Get all users with stats ordered by sportIndex
  const allUsersWithStats = await prisma.userStats.findMany({
    orderBy: { sportIndex: 'desc' },
    include: { user: true },
    take: 100,
  })

  const leaderboardData = allUsersWithStats.map((stats, index) => ({
    userId: stats.userId,
    rank: index + 1,
    score: stats.sportIndex,
    name: stats.user.displayName,
    avatar: stats.user.avatarUrl,
    location: stats.city || 'Unknown',
  }))

  await prisma.rankingCache.upsert({
    where: {
      dimension_disciplineId_sportId_scope_scopeValue_period_verifiedOnly: {
        dimension: 'SPORT_INDEX',
        disciplineId: '',
        sportId: '',
        scope: 'GLOBAL',
        scopeValue: '',
        period: 'ALL_TIME',
        verifiedOnly: false,
      },
    },
    update: {
      leaderboard: JSON.stringify(leaderboardData),
      totalUsers: allUsersWithStats.length,
      calculatedAt: new Date(),
    },
    create: {
      dimension: 'SPORT_INDEX',
      disciplineId: null,
      sportId: null,
      scope: 'GLOBAL',
      scopeValue: null,
      period: 'ALL_TIME',
      verifiedOnly: false,
      leaderboard: JSON.stringify(leaderboardData),
      totalUsers: allUsersWithStats.length,
    }
  }).catch(() => {
    console.log('  ⚠️ Could not update ranking cache (unique constraint)')
  })

  console.log('  ✓ Ranking cache updated')

  console.log('\n✨ Admin data seeding complete!')
  console.log(`
Summary:
- ${competitors.length} competitor users created
- ${teams.length} teams created
- ${challenges.length} challenges created
- Partner requests removed in V6
- Admin user stats and activities populated
- Social connections established
  `)
}

seedAdminData()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
