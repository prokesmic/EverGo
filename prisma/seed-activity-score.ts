import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Seeds the "All Sports" sport with "Activity Score" discipline
 * This is the universal "Most Active" ranking that works across all sports.
 *
 * Activity Score formula (from spec):
 * - Base points: Effort Points = SUM(durationMinutes * sportMultiplier * intensityFactor)
 * - Sport multiplier: Different for each sport category
 * - Intensity factor: 1.0 (easy), 1.3 (moderate), 1.6 (hard), 2.0 (max effort)
 * - Time decay: Points from more than 7 days ago count at 50%
 * - Rolling window: Last 30 days
 */
async function seedActivityScore() {
  console.log("🏆 Seeding All Sports + Activity Score discipline...")

  // 1. Create "All Sports" sport (hidden from sport selection but shown in leaderboards)
  const allSportsSport = await prisma.sport.upsert({
    where: { slug: "all-sports" },
    update: {
      name: "All Sports",
      icon: "🏆",
      category: "GENERIC",
      hasGpsTracking: false,
    },
    create: {
      name: "All Sports",
      slug: "all-sports",
      icon: "🏆",
      category: "GENERIC",
      hasGpsTracking: false,
    },
  })
  console.log(`  ✅ Sport: ${allSportsSport.name} (${allSportsSport.id})`)

  // 2. Create "Activity Score" discipline under All Sports
  const activityScoreDiscipline = await prisma.discipline.upsert({
    where: {
      sportId_slug: {
        sportId: allSportsSport.id,
        slug: "activity-score"
      }
    },
    update: {
      name: "Activity Score",
      measurementType: "POINTS",
      primaryMetric: "effort_points",
      rankingFormula: "sum(effort_points)",
      lowerIsBetter: false, // Higher is better
      unit: "points",
      scoringKind: "PERIOD_SUM", // Rolling window sum
      validityMonths: 1, // 30 day rolling window
      isActive: true,
      displayOrder: 0, // Show first
    },
    create: {
      sportId: allSportsSport.id,
      name: "Activity Score",
      slug: "activity-score",
      measurementType: "POINTS",
      primaryMetric: "effort_points",
      rankingFormula: "sum(effort_points)",
      lowerIsBetter: false, // Higher is better
      unit: "points",
      scoringKind: "PERIOD_SUM", // Rolling window sum
      validityMonths: 1, // 30 day rolling window
      isActive: true,
      displayOrder: 0, // Show first
    },
  })
  console.log(`  ✅ Discipline: ${activityScoreDiscipline.name} (${activityScoreDiscipline.id})`)

  console.log("✅ Activity Score seeded successfully!")
  console.log("")
  console.log("📊 Activity Score Configuration:")
  console.log("   - Sport: All Sports (hidden from sport selection)")
  console.log("   - Discipline: Activity Score")
  console.log("   - Scoring: PERIOD_SUM (rolling 30-day window)")
  console.log("   - Better: HIGHER scores rank higher")
  console.log("")
  console.log("💡 To calculate a user's Activity Score:")
  console.log("   1. Get all activities from last 30 days")
  console.log("   2. For each activity: points = durationMinutes * sportMultiplier * intensityFactor")
  console.log("   3. Time decay: Activities > 7 days old count at 50%")
  console.log("   4. Sum all points = Activity Score")
}

seedActivityScore()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
