/**
 * API Route: /api/me/ribbon
 *
 * Returns ribbon stats for the current user.
 * Supports range query param: week | month | year | all
 *
 * V7: Returns sport-aware metrics based on user's primary sport.
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getRibbonViewModel, isValidRange } from "@/lib/ribbon/getRibbonViewModel"
import type { RibbonRange } from "@/lib/ribbon/ribbonConfig"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get range from query params
    const { searchParams } = new URL(request.url)
    const rangeParam = searchParams.get("range") ?? "week"

    // Validate range
    if (!isValidRange(rangeParam)) {
      return NextResponse.json(
        { error: "Invalid range. Must be: week, month, year, or all" },
        { status: 400 }
      )
    }

    const range: RibbonRange = rangeParam

    // Fetch sport-aware ribbon view model
    const viewModel = await getRibbonViewModel(user.id, range)

    return NextResponse.json(viewModel)
  } catch (error) {
    console.error("[API] /api/me/ribbon error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
