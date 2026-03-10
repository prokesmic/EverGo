import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { canAccessCoachDashboard, getTeamCoachDashboard } from "@/lib/elite/team-coach"

interface Params {
  params: Promise<{ slug: string }>
}

export async function GET(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { slug } = await params
  const team = await prisma.team.findUnique({
    where: { slug },
    select: { id: true },
  })
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 })
  }

  const allowed = await canAccessCoachDashboard(team.id, user.id)
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const dashboard = await getTeamCoachDashboard(slug)
  return NextResponse.json({ dashboard })
}
