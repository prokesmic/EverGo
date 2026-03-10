import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { buildAdaptivePlan } from "@/lib/elite/adaptive-plan"

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const minutes = Number.parseInt(searchParams.get("minutes") || "45", 10)
  const plan = await buildAdaptivePlan(user.id, Number.isFinite(minutes) ? minutes : 45)
  return NextResponse.json({ plan })
}
