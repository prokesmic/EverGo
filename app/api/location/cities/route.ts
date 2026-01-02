import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const country = searchParams.get("country")
    const q = searchParams.get("q")?.toLowerCase().trim() || ""

    if (!country) {
      return NextResponse.json(
        { error: "Country code is required" },
        { status: 400 }
      )
    }

    const cities = await prisma.city.findMany({
      where: {
        countryCode: country,
        ...(q
          ? {
              normalized: {
                contains: q,
              },
            }
          : {}),
      },
      orderBy: [{ population: "desc" }, { name: "asc" }],
      take: 20,
      select: {
        id: true,
        name: true,
        population: true,
      },
    })

    return NextResponse.json({ cities })
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    )
  }
}
