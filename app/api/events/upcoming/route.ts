import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { format } from "date-fns"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ events: [] })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, city: true },
    })

    if (!user) {
      return NextResponse.json({ events: [] })
    }

    // Fetch upcoming events from the database
    // For now, check if Event model exists - if not, return empty array
    // This handles the case where events haven't been implemented yet
    try {
      // @ts-ignore - Event model may not exist yet
      const events = await prisma.event?.findMany({
        where: {
          startDate: { gte: new Date() },
          OR: [
            { isPublic: true },
            { creatorId: user.id },
            // TODO: Add events from user's teams
          ],
        },
        orderBy: { startDate: "asc" },
        take: 5,
        include: {
          sport: true,
        },
      })

      if (!events) {
        return NextResponse.json({ events: [] })
      }

      const formattedEvents = events.map((event: any) => ({
        id: event.id,
        title: event.title,
        date: event.startDate,
        time: format(new Date(event.startDate), "HH:mm"),
        sport: event.sport?.name || "General",
        location: event.location || undefined,
      }))

      return NextResponse.json({ events: formattedEvents })
    } catch {
      // Event model doesn't exist yet
      return NextResponse.json({ events: [] })
    }
  } catch (error) {
    console.error("Error fetching upcoming events:", error)
    return NextResponse.json({ events: [] })
  }
}
