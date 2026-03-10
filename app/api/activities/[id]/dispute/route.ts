import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createActivityDispute } from "@/lib/elite/activity-confidence"

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const reporter = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })
  if (!reporter) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const reason = typeof body?.reason === "string" ? body.reason.trim() : ""
  const note = typeof body?.note === "string" ? body.note.trim() : undefined

  if (reason.length < 4) {
    return NextResponse.json({ error: "Reason is required" }, { status: 400 })
  }

  try {
    const dispute = await createActivityDispute({
      reporterUserId: reporter.id,
      activityId: id,
      reason,
      note,
    })

    return NextResponse.json({
      dispute: {
        id: dispute.id,
        status: dispute.status,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create dispute"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
