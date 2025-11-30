import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params

        const records = await prisma.personalRecord.findMany({
            where: {
                userId: userId
            },
            include: {
                discipline: {
                    include: {
                        sport: true
                    }
                }
            },
            orderBy: {
                achievedAt: 'desc'
            }
        })

        return NextResponse.json(records)
    } catch (error) {
        console.error("Failed to fetch personal records", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
