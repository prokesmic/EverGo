#!/usr/bin/env tsx
/**
 * seedBenchmarks.ts - Seeds BenchmarkDefinitions for all sports
 *
 * This script creates benchmark definitions for each sport based on the
 * category templates. Run this after seeding sports.
 *
 * Usage:
 *   npx tsx scripts/seedBenchmarks.ts
 *   npm run seed:benchmarks
 */

import { Prisma, PrismaClient } from "@prisma/client"
import { CATEGORY_TEMPLATES } from "../lib/benchmarks/templates"
import { inferSportCategory } from "../lib/benchmarks/sportCategory"

const prisma = new PrismaClient()

// Helper to convert Record<string, unknown> to Prisma.InputJsonValue
function toJsonValue(val: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined {
  if (val === undefined) return undefined
  return val as Prisma.InputJsonValue
}

async function main() {
  console.log("Seeding benchmark definitions for all sports...\n")

  const sports = await prisma.sport.findMany({
    select: { id: true, name: true, slug: true },
  })

  if (sports.length === 0) {
    console.log("No sports found. Please run the main seed first.")
    process.exit(1)
  }

  let totalCreated = 0
  let totalUpdated = 0

  for (const sport of sports) {
    const category = inferSportCategory(sport.name)
    const templates = CATEGORY_TEMPLATES[category] ?? CATEGORY_TEMPLATES.GENERIC

    console.log(`${sport.name} -> Category: ${category}`)

    for (const template of templates.slice(0, 5)) {
      const slug = template.slug

      try {
        const result = await prisma.benchmarkDefinition.upsert({
          where: {
            sportId_slug: {
              sportId: sport.id,
              slug,
            },
          },
          update: {
            name: template.name,
            measurementType: template.measurementType,
            unit: template.unit,
            higherIsBetter: template.higherIsBetter,
            targetJson: toJsonValue(template.targetJson),
            rankWeight: template.rankWeight ?? 1.0,
            isActive: true,
          },
          create: {
            sportId: sport.id,
            slug,
            name: template.name,
            measurementType: template.measurementType,
            unit: template.unit,
            higherIsBetter: template.higherIsBetter,
            targetJson: toJsonValue(template.targetJson),
            rankWeight: template.rankWeight ?? 1.0,
            isActive: true,
            validityMonths: 24,
            decayAfterMonths: 12,
          },
        })

        // Check if it was an update or create
        const wasCreated = result.createdAt.getTime() === result.updatedAt.getTime()
        if (wasCreated) {
          totalCreated++
          console.log(`  + Created: ${template.name}`)
        } else {
          totalUpdated++
          console.log(`  ~ Updated: ${template.name}`)
        }
      } catch (error) {
        console.error(`  ! Error with ${template.name}:`, error)
      }
    }
  }

  console.log("\n---")
  console.log(`Benchmarks seeded for ${sports.length} sports.`)
  console.log(`Created: ${totalCreated}, Updated: ${totalUpdated}`)
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
