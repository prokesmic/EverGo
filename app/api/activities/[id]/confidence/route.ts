import { NextResponse } from "next/server"
import { getActivityIntegrity } from "@/lib/elite/activity-confidence"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const integrity = await getActivityIntegrity(id)
  if (!integrity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 })
  }

  return NextResponse.json(integrity)
}
