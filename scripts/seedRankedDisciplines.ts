#!/usr/bin/env tsx
/**
 * seedRankedDisciplines.ts - Seeds Ranked Disciplines v4 data
 *
 * Creates/updates disciplines with fairness badges, verification badges,
 * and ranking metadata for all sports.
 *
 * Usage:
 *   npx tsx scripts/seedRankedDisciplines.ts
 *   npm run seed:disciplines
 */

import {
  PrismaClient,
  DisciplineKind,
  FairnessBadge,
  VerificationBadge,
  MeasurementType,
} from "@prisma/client"

const prisma = new PrismaClient()

// =============================================================================
// RANKED DISCIPLINES CATALOG
// Based on the v4 spec - comprehensive ranking metadata
// =============================================================================

type RankedDisciplineSeed = {
  sportSlug: string
  slug: string
  name: string
  kind: DisciplineKind
  fairnessBadge: FairnessBadge
  verificationBadge: VerificationBadge
  measurement: MeasurementType
  unitLabel: string
  higherIsBetter: boolean
  requireVerifiedForGlobal: boolean
  allowManualAtAll: boolean
  primaryMetric: string
  rankingFormula: string
  displayOrder: number
}

const RANKED_DISCIPLINES: RankedDisciplineSeed[] = [
  // ===========================================================================
  // RUNNING
  // ===========================================================================
  {
    sportSlug: "running",
    slug: "5k-time",
    name: "5K Time",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MIXED",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "time",
    rankingFormula: "best_time",
    displayOrder: 1,
  },
  {
    sportSlug: "running",
    slug: "10k-time",
    name: "10K Time",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MIXED",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "time",
    rankingFormula: "best_time",
    displayOrder: 2,
  },
  {
    sportSlug: "running",
    slug: "half-marathon",
    name: "Half Marathon",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MIXED",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "time",
    rankingFormula: "best_time",
    displayOrder: 3,
  },
  {
    sportSlug: "running",
    slug: "marathon",
    name: "Marathon",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MIXED",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "time",
    rankingFormula: "best_time",
    displayOrder: 4,
  },
  {
    sportSlug: "running",
    slug: "trail-effort",
    name: "Trail Running Effort",
    kind: "BENCHMARK",
    fairnessBadge: "NORMALIZED",
    verificationBadge: "VERIFIED",
    measurement: "SCORE",
    unitLabel: "pts",
    higherIsBetter: true,
    requireVerifiedForGlobal: true,
    allowManualAtAll: false,
    primaryMetric: "normalized_effort",
    rankingFormula: "best_effort_score",
    displayOrder: 5,
  },

  // ===========================================================================
  // CYCLING
  // ===========================================================================
  {
    sportSlug: "cycling",
    slug: "ftp",
    name: "FTP (Functional Threshold Power)",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "VERIFIED",
    measurement: "POWER_WKG",
    unitLabel: "W/kg",
    higherIsBetter: true,
    requireVerifiedForGlobal: true,
    allowManualAtAll: true,
    primaryMetric: "power_wkg",
    rankingFormula: "best_ftp",
    displayOrder: 1,
  },
  {
    sportSlug: "cycling",
    slug: "100k-time",
    name: "100K Time",
    kind: "BENCHMARK",
    fairnessBadge: "NORMALIZED",
    verificationBadge: "MIXED",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "time",
    rankingFormula: "best_time",
    displayOrder: 2,
  },
  {
    sportSlug: "cycling",
    slug: "strava-segment",
    name: "Strava Segment",
    kind: "BENCHMARK",
    fairnessBadge: "SEGMENT",
    verificationBadge: "VERIFIED",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: true,
    allowManualAtAll: false,
    primaryMetric: "segment_time",
    rankingFormula: "best_segment_time",
    displayOrder: 3,
  },

  // ===========================================================================
  // SWIMMING
  // ===========================================================================
  {
    sportSlug: "swimming",
    slug: "100m-freestyle",
    name: "100m Freestyle",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MIXED",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "time",
    rankingFormula: "best_time",
    displayOrder: 1,
  },
  {
    sportSlug: "swimming",
    slug: "1500m-freestyle",
    name: "1500m Freestyle",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MIXED",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "time",
    rankingFormula: "best_time",
    displayOrder: 2,
  },
  {
    sportSlug: "swimming",
    slug: "css-pace",
    name: "CSS (Critical Swim Speed)",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MIXED",
    measurement: "SPEED_KMH",
    unitLabel: "min/100m",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "pace",
    rankingFormula: "best_css",
    displayOrder: 3,
  },

  // ===========================================================================
  // WEIGHTLIFTING
  // ===========================================================================
  {
    sportSlug: "weightlifting",
    slug: "bench-1rm",
    name: "Bench Press 1RM",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MANUAL",
    measurement: "WEIGHT_KG",
    unitLabel: "kg",
    higherIsBetter: true,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "weight",
    rankingFormula: "best_weight",
    displayOrder: 1,
  },
  {
    sportSlug: "weightlifting",
    slug: "squat-1rm",
    name: "Squat 1RM",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MANUAL",
    measurement: "WEIGHT_KG",
    unitLabel: "kg",
    higherIsBetter: true,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "weight",
    rankingFormula: "best_weight",
    displayOrder: 2,
  },
  {
    sportSlug: "weightlifting",
    slug: "deadlift-1rm",
    name: "Deadlift 1RM",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MANUAL",
    measurement: "WEIGHT_KG",
    unitLabel: "kg",
    higherIsBetter: true,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "weight",
    rankingFormula: "best_weight",
    displayOrder: 3,
  },

  // ===========================================================================
  // CROSSFIT
  // ===========================================================================
  {
    sportSlug: "crossfit",
    slug: "fran-time",
    name: "Fran Time",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MANUAL",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "time",
    rankingFormula: "best_time",
    displayOrder: 1,
  },
  {
    sportSlug: "crossfit",
    slug: "murph-time",
    name: "Murph Time",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MANUAL",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "time",
    rankingFormula: "best_time",
    displayOrder: 2,
  },

  // ===========================================================================
  // CLIMBING
  // ===========================================================================
  {
    sportSlug: "climbing",
    slug: "boulder-grade",
    name: "Boulder Grade",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MANUAL",
    measurement: "GRADE",
    unitLabel: "V-grade",
    higherIsBetter: true,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "grade",
    rankingFormula: "best_grade",
    displayOrder: 1,
  },
  {
    sportSlug: "climbing",
    slug: "sport-grade",
    name: "Sport Climbing Grade",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MANUAL",
    measurement: "GRADE",
    unitLabel: "YDS",
    higherIsBetter: true,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "grade",
    rankingFormula: "best_grade",
    displayOrder: 2,
  },

  // ===========================================================================
  // TRIATHLON
  // ===========================================================================
  {
    sportSlug: "triathlon",
    slug: "sprint-time",
    name: "Sprint Triathlon",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MIXED",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "time",
    rankingFormula: "best_time",
    displayOrder: 1,
  },
  {
    sportSlug: "triathlon",
    slug: "olympic-time",
    name: "Olympic Triathlon",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MIXED",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "time",
    rankingFormula: "best_time",
    displayOrder: 2,
  },
  {
    sportSlug: "triathlon",
    slug: "ironman-time",
    name: "Ironman",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MIXED",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "time",
    rankingFormula: "best_time",
    displayOrder: 3,
  },

  // ===========================================================================
  // TENNIS
  // ===========================================================================
  {
    sportSlug: "tennis",
    slug: "elo-rating",
    name: "ELO Rating",
    kind: "ELO_RATING",
    fairnessBadge: "RATING",
    verificationBadge: "MANUAL",
    measurement: "SCORE",
    unitLabel: "pts",
    higherIsBetter: true,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "elo",
    rankingFormula: "current_elo",
    displayOrder: 1,
  },

  // ===========================================================================
  // GOLF
  // ===========================================================================
  {
    sportSlug: "golf",
    slug: "handicap",
    name: "Handicap Index",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MANUAL",
    measurement: "SCORE",
    unitLabel: "hcp",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "handicap",
    rankingFormula: "best_handicap",
    displayOrder: 1,
  },

  // ===========================================================================
  // KITESURFING
  // ===========================================================================
  {
    sportSlug: "kitesurfing",
    slug: "max-height",
    name: "Max Jump Height",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "VERIFIED",
    measurement: "HEIGHT_METERS",
    unitLabel: "m",
    higherIsBetter: true,
    requireVerifiedForGlobal: true,
    allowManualAtAll: false,
    primaryMetric: "height",
    rankingFormula: "best_height",
    displayOrder: 1,
  },
  {
    sportSlug: "kitesurfing",
    slug: "max-airtime",
    name: "Max Airtime",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "VERIFIED",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: true,
    requireVerifiedForGlobal: true,
    allowManualAtAll: false,
    primaryMetric: "airtime",
    rankingFormula: "best_airtime",
    displayOrder: 2,
  },

  // ===========================================================================
  // SURFING
  // ===========================================================================
  {
    sportSlug: "surfing",
    slug: "wave-score",
    name: "Wave Score",
    kind: "BENCHMARK",
    fairnessBadge: "NORMALIZED",
    verificationBadge: "MIXED",
    measurement: "SCORE",
    unitLabel: "pts",
    higherIsBetter: true,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "score",
    rankingFormula: "best_wave_score",
    displayOrder: 1,
  },
  {
    sportSlug: "surfing",
    slug: "max-speed",
    name: "Max Speed",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "VERIFIED",
    measurement: "SPEED_KMH",
    unitLabel: "km/h",
    higherIsBetter: true,
    requireVerifiedForGlobal: true,
    allowManualAtAll: false,
    primaryMetric: "speed",
    rankingFormula: "best_speed",
    displayOrder: 2,
  },

  // ===========================================================================
  // SKIING
  // ===========================================================================
  {
    sportSlug: "skiing",
    slug: "max-speed",
    name: "Max Speed",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "VERIFIED",
    measurement: "SPEED_KMH",
    unitLabel: "km/h",
    higherIsBetter: true,
    requireVerifiedForGlobal: true,
    allowManualAtAll: false,
    primaryMetric: "speed",
    rankingFormula: "best_speed",
    displayOrder: 1,
  },
  {
    sportSlug: "skiing",
    slug: "vertical-day",
    name: "Vertical in a Day",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MIXED",
    measurement: "DISTANCE_METERS",
    unitLabel: "m",
    higherIsBetter: true,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "vertical",
    rankingFormula: "best_vertical",
    displayOrder: 2,
  },

  // ===========================================================================
  // ROWING
  // ===========================================================================
  {
    sportSlug: "rowing",
    slug: "2k-erg",
    name: "2K Erg Time",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MIXED",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "time",
    rankingFormula: "best_time",
    displayOrder: 1,
  },
  {
    sportSlug: "rowing",
    slug: "500m-split",
    name: "500m Split",
    kind: "BENCHMARK",
    fairnessBadge: "STANDARD",
    verificationBadge: "MIXED",
    measurement: "TIME_SECONDS",
    unitLabel: "sec",
    higherIsBetter: false,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "split",
    rankingFormula: "best_split",
    displayOrder: 2,
  },

  // ===========================================================================
  // YOGA (Fitness Score based)
  // ===========================================================================
  {
    sportSlug: "yoga",
    slug: "fitness-score",
    name: "Yoga Fitness Score",
    kind: "FITNESS_SCORE",
    fairnessBadge: "NORMALIZED",
    verificationBadge: "MANUAL",
    measurement: "SCORE",
    unitLabel: "pts",
    higherIsBetter: true,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "weekly_minutes",
    rankingFormula: "activity_score",
    displayOrder: 1,
  },

  // ===========================================================================
  // HIKING
  // ===========================================================================
  {
    sportSlug: "hiking",
    slug: "elevation-gain",
    name: "Monthly Elevation Gain",
    kind: "BENCHMARK",
    fairnessBadge: "NORMALIZED",
    verificationBadge: "MIXED",
    measurement: "DISTANCE_METERS",
    unitLabel: "m",
    higherIsBetter: true,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "elevation",
    rankingFormula: "monthly_elevation",
    displayOrder: 1,
  },

  // ===========================================================================
  // BASKETBALL
  // ===========================================================================
  {
    sportSlug: "basketball",
    slug: "elo-rating",
    name: "ELO Rating",
    kind: "ELO_RATING",
    fairnessBadge: "RATING",
    verificationBadge: "MANUAL",
    measurement: "SCORE",
    unitLabel: "pts",
    higherIsBetter: true,
    requireVerifiedForGlobal: false,
    allowManualAtAll: true,
    primaryMetric: "elo",
    rankingFormula: "current_elo",
    displayOrder: 1,
  },
]

async function main() {
  console.log("Seeding Ranked Disciplines v4...\n")

  let created = 0
  let updated = 0
  let skipped = 0

  for (const disc of RANKED_DISCIPLINES) {
    // Find the sport
    const sport = await prisma.sport.findUnique({
      where: { slug: disc.sportSlug },
    })

    if (!sport) {
      console.log(`  ! Sport not found: ${disc.sportSlug} - skipping ${disc.name}`)
      skipped++
      continue
    }

    try {
      // Try to find existing discipline
      const existing = await prisma.discipline.findFirst({
        where: {
          sportId: sport.id,
          slug: disc.slug,
        },
      })

      if (existing) {
        // Update existing discipline with v4 fields
        await prisma.discipline.update({
          where: { id: existing.id },
          data: {
            name: disc.name,
            kind: disc.kind,
            fairnessBadge: disc.fairnessBadge,
            verificationBadge: disc.verificationBadge,
            measurement: disc.measurement,
            unitLabel: disc.unitLabel,
            higherIsBetter: disc.higherIsBetter,
            requireVerifiedForGlobal: disc.requireVerifiedForGlobal,
            allowManualAtAll: disc.allowManualAtAll,
            primaryMetric: disc.primaryMetric,
            rankingFormula: disc.rankingFormula,
            displayOrder: disc.displayOrder,
            isRanked: true,
            isActive: true,
          },
        })
        updated++
        console.log(`  ~ Updated: ${sport.name} / ${disc.name}`)
      } else {
        // Create new discipline
        await prisma.discipline.create({
          data: {
            sportId: sport.id,
            slug: disc.slug,
            name: disc.name,
            kind: disc.kind,
            fairnessBadge: disc.fairnessBadge,
            verificationBadge: disc.verificationBadge,
            measurement: disc.measurement,
            unitLabel: disc.unitLabel,
            higherIsBetter: disc.higherIsBetter,
            requireVerifiedForGlobal: disc.requireVerifiedForGlobal,
            allowManualAtAll: disc.allowManualAtAll,
            primaryMetric: disc.primaryMetric,
            rankingFormula: disc.rankingFormula,
            displayOrder: disc.displayOrder,
            isRanked: true,
            isActive: true,
          },
        })
        created++
        console.log(`  + Created: ${sport.name} / ${disc.name}`)
      }
    } catch (error) {
      console.error(`  ! Error with ${disc.name}:`, error)
    }
  }

  console.log("\n" + "=".repeat(50))
  console.log("Summary:")
  console.log(`  Created: ${created}`)
  console.log(`  Updated: ${updated}`)
  console.log(`  Skipped: ${skipped}`)
  console.log(`  Total in catalog: ${RANKED_DISCIPLINES.length}`)
  console.log("=".repeat(50))
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
