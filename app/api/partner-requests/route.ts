import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const city = searchParams.get("city")
        const sportId = searchParams.get("sportId")

        const where: any = {
            status: "OPEN",
            date: {
                gte: new Date()
            }
        }

        if (city) {
            where.city = city
        }

        if (sportId) {
            where.sportId = sportId
        }

        const requests = await prisma.partnerRequest.findMany({
            where,
            include: {
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        username: true
                    }
                },
                sport: true,
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                avatarUrl: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                date: 'asc'
            }
        })

        return NextResponse.json(requests)
    } catch (error) {
        console.error("Failed to fetch partner requests", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { sportId, title, description, date, durationMinutes, distanceKm, location, city, minParticipants, maxParticipants } = body

        const request = await prisma.partnerRequest.create({
            data: {
                creatorId: session.user.id,
                sportId,
                title,
                description,
                date: new Date(date),
                durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
                distanceKm: distanceKm ? parseFloat(distanceKm) : null,
                location,
                city,
                minParticipants: parseInt(minParticipants),
                maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
                participants: {
                    create: {
                        userId: session.user.id,
                        status: "ACCEPTED"
                    }
                }
            }
        })

        return NextResponse.json(request)
    } catch (error) {
        console.error("Failed to create partner request", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
