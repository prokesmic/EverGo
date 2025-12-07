import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const sports = await prisma.sport.findMany({
    select: { id: true, name: true },
  })
  console.log("Sports in database:")
  sports.forEach((sport) => {
    console.log(`  ${sport.name}: ${sport.id}`)
  })
}

main().finally(() => prisma.$disconnect())
