import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function seedSports() {
  console.log("🏃 Seeding sports...")

  const sports = [
    {
      name: "Running",
      slug: "running",
      icon: "🏃",
      category: "ENDURANCE",
      hasGpsTracking: true,
    },
    {
      name: "Cycling",
      slug: "cycling",
      icon: "🚴",
      category: "ENDURANCE",
      hasGpsTracking: true,
    },
    {
      name: "Swimming",
      slug: "swimming",
      icon: "🏊",
      category: "ENDURANCE",
      hasGpsTracking: false,
    },
    {
      name: "Hiking",
      slug: "hiking",
      icon: "🥾",
      category: "ENDURANCE",
      hasGpsTracking: true,
    },
    {
      name: "Walking",
      slug: "walking",
      icon: "🚶",
      category: "ENDURANCE",
      hasGpsTracking: true,
    },
    {
      name: "Gym",
      slug: "gym",
      icon: "💪",
      category: "STRENGTH",
      hasGpsTracking: false,
    },
    {
      name: "Yoga",
      slug: "yoga",
      icon: "🧘",
      category: "FLEXIBILITY",
      hasGpsTracking: false,
    },
  ]

  for (const sport of sports) {
    await prisma.sport.upsert({
      where: { slug: sport.slug },
      update: {},
      create: sport,
    })
    console.log(`  ✅ ${sport.name}`)
  }

  console.log("✅ Sports seeded successfully!")
}

seedSports()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
