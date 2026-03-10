import { NextResponse } from "next/server"
import { getActivityConfidence } from "@/lib/elite/activity-confidence"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const confidence = await getActivityConfidence(id)
  if (!confidence) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 })
  }

  return NextResponse.json({ confidence })
}
