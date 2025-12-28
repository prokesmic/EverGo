#!/usr/bin/env tsx
/**
 * seedSportsAndBenchmarks.ts - Seeds Sports + BenchmarkDefinitions for all sports
 *
 * This script creates the full sport catalog with benchmark definitions
 * based on the SPORTS_CATALOG. It's idempotent - safe to run multiple times.
 *
 * Usage:
 *   npx tsx scripts/seedSportsAndBenchmarks.ts
 *   npm run seed:sportsbench
 */

import { Prisma, PrismaClient } from "@prisma/client"
import { SPORTS_CATALOG } from "../lib/benchmarks/sportsCatalog"

const prisma = new PrismaClient()

// Helper to convert Record<string, unknown> to Prisma.InputJsonValue
function toJsonValue(val: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined {
  if (val === undefined) return undefined
  return val as Prisma.InputJsonValue
}

async function main() {
  console.log("Seeding Sports + Benchmark Definitions...\n")

  let sportsCreated = 0
  let sportsUpdated = 0
  let benchmarksCreated = 0
  let benchmarksUpdated = 0

  for (const sportSeed of SPORTS_CATALOG) {
    // Upsert the sport
    const existingSport = await prisma.sport.findUnique({
      where: { slug: sportSeed.slug },
    })

    let sport
    if (existingSport) {
      sport = await prisma.sport.update({
        where: { slug: sportSeed.slug },
        data: {
          name: sportSeed.name,
          category: sportSeed.category,
          icon: sportSeed.icon,
        },
      })
      sportsUpdated++
      console.log(`~ Updated sport: ${sport.name}`)
    } else {
      sport = await prisma.sport.create({
        data: {
          name: sportSeed.name,
          slug: sportSeed.slug,
          icon: sportSeed.icon,
          category: sportSeed.category,
        },
      })
      sportsCreated++
      console.log(`+ Created sport: ${sport.name}`)
    }

    // Upsert benchmarks for this sport (max 5)
    for (const benchSeed of sportSeed.benchmarks.slice(0, 5)) {
      try {
        const result = await prisma.benchmarkDefinition.upsert({
          where: {
            sportId_slug: {
              sportId: sport.id,
              slug: benchSeed.slug,
            },
          },
          update: {
            name: benchSeed.name,
            measurementType: benchSeed.measurementType,
            unit: benchSeed.unit,
            higherIsBetter: benchSeed.higherIsBetter,
            targetJson: toJsonValue(benchSeed.targetJson),
            rankWeight: benchSeed.rankWeight ?? 1.0,
            isActive: true,
          },
          create: {
            sportId: sport.id,
            slug: benchSeed.slug,
            name: benchSeed.name,
            measurementType: benchSeed.measurementType,
            unit: benchSeed.unit,
            higherIsBetter: benchSeed.higherIsBetter,
            targetJson: toJsonValue(benchSeed.targetJson),
            rankWeight: benchSeed.rankWeight ?? 1.0,
            isActive: true,
            validityMonths: 24,
            decayAfterMonths: 12,
          },
        })

        // Check if it was an update or create
        const wasCreated = result.createdAt.getTime() === result.updatedAt.getTime()
        if (wasCreated) {
          benchmarksCreated++
          console.log(`  + Created benchmark: ${benchSeed.name}`)
        } else {
          benchmarksUpdated++
          console.log(`  ~ Updated benchmark: ${benchSeed.name}`)
        }
      } catch (error) {
        console.error(`  ! Error with benchmark ${benchSeed.name}:`, error)
      }
    }
  }

  console.log("\n" + "=".repeat(50))
  console.log("Summary:")
  console.log(`  Sports:     ${sportsCreated} created, ${sportsUpdated} updated`)
  console.log(`  Benchmarks: ${benchmarksCreated} created, ${benchmarksUpdated} updated`)
  console.log(`  Total sports in catalog: ${SPORTS_CATALOG.length}`)
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
