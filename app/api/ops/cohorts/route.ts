import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getRetentionCohortSnapshot } from "@/lib/elite/ops"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cohorts = await getRetentionCohortSnapshot()
  return NextResponse.json({ cohorts })
}
