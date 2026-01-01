import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sportId: string }> }
) {
  try {
    const { sportId } = await params

    const disciplines = await prisma.discipline.findMany({
      where: {
        sportId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        unit: true,
      },
      orderBy: { displayOrder: "asc" },
    })

    return NextResponse.json({ disciplines })
  } catch (error) {
    console.error("Error fetching disciplines:", error)
    return NextResponse.json({ disciplines: [] })
  }
}
