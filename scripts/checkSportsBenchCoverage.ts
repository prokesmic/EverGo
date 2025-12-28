#!/usr/bin/env tsx
/**
 * checkSportsBenchCoverage.ts - Validates sports and benchmarks coverage
 *
 * This script checks that:
 * 1. All sports from SPORTS_CATALOG exist in the database
 * 2. Each sport has at least 1 active benchmark
 * 3. Reports any mismatches or missing items
 *
 * Usage:
 *   npx tsx scripts/checkSportsBenchCoverage.ts
 *   npm run check:sportsbench
 */

import { PrismaClient } from "@prisma/client"
import { SPORTS_CATALOG } from "../lib/benchmarks/sportsCatalog"

const prisma = new PrismaClient()

async function main() {
  console.log("Checking Sports + Benchmark Coverage...\n")

  let hasErrors = false

  // Get all sports from DB
  const dbSports = await prisma.sport.findMany({
    select: { id: true, slug: true, name: true, category: true },
  })
  const dbSportsBySlug = new Map(dbSports.map((s) => [s.slug, s]))

  console.log(`SPORTS_CATALOG has ${SPORTS_CATALOG.length} sports`)
  console.log(`Database has ${dbSports.length} sports\n`)

  // Check for missing sports
  const missingSports: string[] = []
  for (const catalogSport of SPORTS_CATALOG) {
    if (!dbSportsBySlug.has(catalogSport.slug)) {
      missingSports.push(catalogSport.slug)
    }
  }

  if (missingSports.length > 0) {
    console.error(`Missing sports in DB: ${missingSports.join(", ")}`)
    hasErrors = true
  }

  // Check benchmarks for each catalog sport
  console.log("Checking benchmark coverage:\n")

  for (const catalogSport of SPORTS_CATALOG) {
    const dbSport = dbSportsBySlug.get(catalogSport.slug)
    if (!dbSport) {
      console.log(`  [ ] ${catalogSport.name} - SPORT MISSING`)
      continue
    }

    const benchmarks = await prisma.benchmarkDefinition.findMany({
      where: { sportId: dbSport.id, isActive: true },
      select: { slug: true, name: true },
    })

    const benchmarkCount = benchmarks.length
    const expectedCount = Math.min(catalogSport.benchmarks.length, 5)

    if (benchmarkCount === 0) {
      console.error(`  [X] ${catalogSport.name} - 0 benchmarks (expected ${expectedCount})`)
      hasErrors = true
    } else if (benchmarkCount < expectedCount) {
      console.warn(`  [!] ${catalogSport.name} - ${benchmarkCount}/${expectedCount} benchmarks`)
    } else {
      console.log(`  [OK] ${catalogSport.name} - ${benchmarkCount} benchmarks`)
    }

    // Check for missing individual benchmarks
    const dbBenchmarkSlugs = new Set(benchmarks.map((b) => b.slug))
    for (const catalogBench of catalogSport.benchmarks.slice(0, 5)) {
      if (!dbBenchmarkSlugs.has(catalogBench.slug)) {
        console.warn(`       Missing: ${catalogBench.name} (${catalogBench.slug})`)
      }
    }
  }

  console.log("\n" + "=".repeat(50))

  if (hasErrors) {
    console.error("\nCoverage check FAILED")
    console.error("Run 'npm run seed:sportsbench' to fix missing data.")
    process.exit(1)
  } else {
    console.log("\nCoverage check PASSED")
    console.log("All sports and benchmarks are properly seeded.")
  }
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
