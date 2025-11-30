import { PrismaClient } from "@prisma/client"
import path from "path"

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// Explicitly resolve the database path for SQLite on Vercel
const dbPath = path.join(process.cwd(), "prisma/dev.db")
const dbUrl = `file:${dbPath}`

console.log("Initializing Prisma Client with DB URL:", dbUrl)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    datasources: {
        db: {
            url: dbUrl
        }
    }
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
