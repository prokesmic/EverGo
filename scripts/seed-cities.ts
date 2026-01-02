import { PrismaClient } from "@prisma/client"
import { CITIES_SEED } from "../lib/location/cities-seed"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding cities...")

  let created = 0
  let skipped = 0

  for (const city of CITIES_SEED) {
    try {
      await prisma.city.upsert({
        where: {
          countryCode_name: {
            countryCode: city.countryCode,
            name: city.name,
          },
        },
        update: {
          normalized: city.normalized,
          lat: city.lat,
          lon: city.lon,
          population: city.population,
        },
        create: {
          countryCode: city.countryCode,
          name: city.name,
          normalized: city.normalized,
          lat: city.lat,
          lon: city.lon,
          population: city.population,
        },
      })
      created++
    } catch (error) {
      console.error(`Failed to seed city: ${city.name} (${city.countryCode})`, error)
      skipped++
    }
  }

  console.log(`Seeded ${created} cities, skipped ${skipped}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
