import { NextResponse } from "next/server"
import { getActivityStory } from "@/lib/elite/storytelling"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const story = await getActivityStory(id)
  if (!story) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 })
  }

  return NextResponse.json({ story })
}
