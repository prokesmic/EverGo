import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sportsData = [
  {
    name: "Running",
    slug: "running",
    icon: "🏃",
    category: "INDIVIDUAL",
    hasGpsTracking: true,
    disciplines: [
      { name: "5K", slug: "5k", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "10K", slug: "10k", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Half Marathon", slug: "half-marathon", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Marathon", slug: "marathon", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Trail Running", slug: "trail", measurementType: "COMPOSITE", primaryMetric: "performance_index", lowerIsBetter: false },
    ]
  },
  {
    name: "Cycling",
    slug: "cycling",
    icon: "🚴",
    category: "INDIVIDUAL",
    hasGpsTracking: true,
    disciplines: [
      { name: "Road Cycling", slug: "road", measurementType: "COMPOSITE", primaryMetric: "ftp_w_kg", lowerIsBetter: false },
      { name: "Mountain Biking", slug: "mtb", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Gravel", slug: "gravel", measurementType: "COMPOSITE", primaryMetric: "endurance_score", lowerIsBetter: false },
      { name: "Track Cycling", slug: "track", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
    ]
  },
  {
    name: "Swimming",
    slug: "swimming",
    icon: "🏊",
    category: "INDIVIDUAL",
    hasGpsTracking: false,
    disciplines: [
      { name: "Freestyle", slug: "freestyle", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Breaststroke", slug: "breaststroke", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Butterfly", slug: "butterfly", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Open Water", slug: "open-water", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
    ]
  },
  {
    name: "Golf",
    slug: "golf",
    icon: "⛳",
    category: "INDIVIDUAL",
    hasGpsTracking: true,
    disciplines: [
      { name: "Stroke Play", slug: "stroke-play", measurementType: "SCORE", primaryMetric: "handicap", lowerIsBetter: true },
      { name: "Match Play", slug: "match-play", measurementType: "SCORE", primaryMetric: "win_percentage", lowerIsBetter: false },
      { name: "Driving Distance", slug: "driving", measurementType: "DISTANCE", primaryMetric: "avg_distance", lowerIsBetter: false },
    ]
  },
  {
    name: "Tennis",
    slug: "tennis",
    icon: "🎾",
    category: "INDIVIDUAL",
    hasGpsTracking: false,
    disciplines: [
      { name: "Singles", slug: "singles", measurementType: "SCORE", primaryMetric: "utr_rating", lowerIsBetter: false },
      { name: "Doubles", slug: "doubles", measurementType: "SCORE", primaryMetric: "utr_rating", lowerIsBetter: false },
      { name: "Clay Court", slug: "clay", measurementType: "SCORE", primaryMetric: "rating", lowerIsBetter: false },
    ]
  },
  {
    name: "Football",
    slug: "football",
    icon: "⚽",
    category: "TEAM",
    hasGpsTracking: true,
    disciplines: [
      { name: "Outfield Player", slug: "outfield", measurementType: "COMPOSITE", primaryMetric: "performance_score", lowerIsBetter: false },
      { name: "Goalkeeper", slug: "goalkeeper", measurementType: "COMPOSITE", primaryMetric: "goalkeeper_score", lowerIsBetter: false },
      { name: "Futsal", slug: "futsal", measurementType: "COMPOSITE", primaryMetric: "rating", lowerIsBetter: false },
    ]
  },
  {
    name: "Basketball",
    slug: "basketball",
    icon: "🏀",
    category: "TEAM",
    hasGpsTracking: false,
    disciplines: [
      { name: "5v5", slug: "5v5", measurementType: "COMPOSITE", primaryMetric: "per_rating", lowerIsBetter: false },
      { name: "3v3", slug: "3v3", measurementType: "COMPOSITE", primaryMetric: "rating", lowerIsBetter: false },
      { name: "Streetball", slug: "streetball", measurementType: "COMPOSITE", primaryMetric: "community_rating", lowerIsBetter: false },
    ]
  },
  {
    name: "Triathlon",
    slug: "triathlon",
    icon: "🏊🚴🏃",
    category: "INDIVIDUAL",
    hasGpsTracking: true,
    disciplines: [
      { name: "Sprint", slug: "sprint", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Olympic", slug: "olympic", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Ironman 70.3", slug: "70.3", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Ironman", slug: "ironman", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
    ]
  },
  {
    name: "Fitness",
    slug: "fitness",
    icon: "💪",
    category: "INDIVIDUAL",
    hasGpsTracking: false,
    disciplines: [
      { name: "CrossFit", slug: "crossfit", measurementType: "COMPOSITE", primaryMetric: "level", lowerIsBetter: false },
      { name: "Powerlifting", slug: "powerlifting", measurementType: "WEIGHT", primaryMetric: "wilks_score", lowerIsBetter: false },
      { name: "Olympic Weightlifting", slug: "olympic-lifting", measurementType: "WEIGHT", primaryMetric: "sinclair_total", lowerIsBetter: false },
      { name: "Functional Fitness", slug: "functional", measurementType: "COMPOSITE", primaryMetric: "fitness_score", lowerIsBetter: false },
    ]
  },
  {
    name: "Climbing",
    slug: "climbing",
    icon: "🧗",
    category: "INDIVIDUAL",
    hasGpsTracking: false,
    disciplines: [
      { name: "Bouldering", slug: "bouldering", measurementType: "SCORE", primaryMetric: "v_grade", lowerIsBetter: false },
      { name: "Sport Climbing", slug: "sport", measurementType: "SCORE", primaryMetric: "yds_grade", lowerIsBetter: false },
      { name: "Trad Climbing", slug: "trad", measurementType: "SCORE", primaryMetric: "grade", lowerIsBetter: false },
      { name: "Speed Climbing", slug: "speed", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
    ]
  },
];

async function main() {
  console.log('Start seeding reference data...')

  // Only seed reference data (Sports and Disciplines)
  // NO user data, NO activities, NO events - those come from real users
  for (const sport of sportsData) {
    const createdSport = await prisma.sport.upsert({
      where: { slug: sport.slug },
      update: {
        // Update existing sports with any new data
        name: sport.name,
        icon: sport.icon,
        category: sport.category,
        hasGpsTracking: sport.hasGpsTracking,
      },
      create: {
        name: sport.name,
        slug: sport.slug,
        icon: sport.icon,
        category: sport.category,
        hasGpsTracking: sport.hasGpsTracking,
        disciplines: {
          create: sport.disciplines.map(d => ({
            name: d.name,
            slug: d.slug,
            measurementType: d.measurementType,
            primaryMetric: d.primaryMetric,
            rankingFormula: "default",
            lowerIsBetter: d.lowerIsBetter
          }))
        }
      },
    })
    console.log(`Seeded sport: ${createdSport.name}`)
  }

  // IMPORTANT: Do NOT seed demo users or activities in production/staging
  // Demo data seeding is ONLY available in local environment with ALLOW_DEMO_DATA=true
  const isLocal = process.env.NEXT_PUBLIC_APP_ENV === 'local' || !process.env.NEXT_PUBLIC_APP_ENV
  const allowDemoData = process.env.ALLOW_DEMO_DATA === 'true'

  if (isLocal && allowDemoData) {
    console.log('Local environment with ALLOW_DEMO_DATA=true - seeding demo data...')

    // Seed demo user only in local dev with explicit flag
    try {
      const { seedUser } = require('./seed-user')
      await seedUser(prisma)

      const { seedCompetitors } = require('./seed-competitors')
      await seedCompetitors(prisma)

      console.log('Demo data seeded successfully')
    } catch (error) {
      console.warn('Could not seed demo data:', error)
    }
  } else {
    console.log('Skipping demo data (not local or ALLOW_DEMO_DATA not set)')
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
