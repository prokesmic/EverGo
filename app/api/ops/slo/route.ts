import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getOpsSLOSnapshot } from "@/lib/elite/ops"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const slo = await getOpsSLOSnapshot()
  return NextResponse.json({ slo })
}
