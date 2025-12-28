/**
 * Hero Coverage Check Script
 *
 * Ensures all sports in the database have hero image coverage.
 * Sports either:
 * 1. Have specific override images in SPORT_HERO_OVERRIDES
 * 2. Map to a category with fallback images
 *
 * Run with: npx tsx scripts/checkHeroCoverage.ts
 */

import { prisma } from "../lib/db"
import { inferHeroCategoryFromSportName, sportToSlug } from "../lib/hero/heroResolver"
import { SPORT_HERO_OVERRIDES, CATEGORY_HERO_IMAGES } from "../lib/hero/heroCatalog"

async function main() {
  console.log("Checking hero coverage for all sports...\n")

  const sports = await prisma.sport.findMany({
    select: { id: true, name: true, category: true }
  })

  if (sports.length === 0) {
    console.log("No sports found in database.")
    return
  }

  const rows = sports
    .map((s) => ({
      id: s.id,
      name: s.name,
      dbCategory: s.category,
      slug: sportToSlug(s.name),
      heroCategory: inferHeroCategoryFromSportName(s.name),
      hasOverride: !!SPORT_HERO_OVERRIDES[sportToSlug(s.name)],
    }))
    .sort((a, b) =>
      a.heroCategory.localeCompare(b.heroCategory) ||
      a.name.localeCompare(b.name)
    )

  console.log(`Sports in DB: ${rows.length}\n`)
  console.log("Category".padEnd(12) + "Has Override".padEnd(14) + "Sport Name (slug)")
  console.log("-".repeat(60))

  for (const r of rows) {
    const override = r.hasOverride ? "✓ Override" : ""
    console.log(
      `${r.heroCategory.padEnd(12)}${override.padEnd(14)}${r.name} (${r.slug})`
    )
  }

  // Summary stats
  const byCategory = rows.reduce((acc, r) => {
    acc[r.heroCategory] = (acc[r.heroCategory] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log("\n" + "=".repeat(60))
  console.log("CATEGORY DISTRIBUTION:")
  console.log("-".repeat(60))

  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    const imageCount = CATEGORY_HERO_IMAGES[cat as keyof typeof CATEGORY_HERO_IMAGES]?.length || 0
    console.log(`${cat.padEnd(12)} ${count} sports, ${imageCount} fallback images`)
  }

  const genericCount = rows.filter((r) => r.heroCategory === "generic").length
  const overrideCount = rows.filter((r) => r.hasOverride).length

  console.log("\n" + "=".repeat(60))
  console.log("SUMMARY:")
  console.log(`Total sports: ${rows.length}`)
  console.log(`With sport overrides: ${overrideCount}`)
  console.log(`In generic category: ${genericCount}`)

  if (genericCount > 0) {
    console.log("\n⚠️  Sports in 'generic' category (consider adding specific hero images):")
    rows.filter((r) => r.heroCategory === "generic").forEach((r) => {
      console.log(`  - ${r.name}`)
    })
  }

  console.log("\n✅ All sports have hero image coverage (via override or category fallback)")
}

main()
  .catch((e) => {
    console.error("Error running hero coverage check:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
