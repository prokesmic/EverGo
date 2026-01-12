/**
 * Backfill script: Set MultiSport as default primary sport for users without one
 *
 * This script:
 * 1. Creates the MultiSport sport record if it doesn't exist
 * 2. Sets primarySportId to MultiSport for all users where it's null
 *
 * Run: npx tsx scripts/backfill-multisport-default.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function backfillMultiSportDefault() {
  console.log("🎯 Starting MultiSport default backfill...")

  // 1. Ensure MultiSport exists
  const multiSport = await prisma.sport.upsert({
    where: { slug: "multisport" },
    update: {},
    create: {
      name: "MultiSport",
      slug: "multisport",
      icon: "🎯",
      category: "GENERAL",
      hasGpsTracking: false,
    },
  })

  console.log(`  ✅ MultiSport sport exists: ${multiSport.id}`)

  // 2. Count users without primary sport
  const usersWithoutPrimary = await prisma.user.count({
    where: { primarySportId: null },
  })

  console.log(`  📊 Users without primary sport: ${usersWithoutPrimary}`)

  if (usersWithoutPrimary === 0) {
    console.log("  ✅ All users already have a primary sport. Nothing to do.")
    return
  }

  // 3. Update users without primary sport to use MultiSport
  const result = await prisma.user.updateMany({
    where: { primarySportId: null },
    data: { primarySportId: multiSport.id },
  })

  console.log(`  ✅ Updated ${result.count} users to use MultiSport as default`)

  console.log("🎉 Backfill complete!")
}

backfillMultiSportDefault()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
