import { NextResponse } from "next/server"
import { updateAllTeamStats, calculateTeamRankings } from "@/lib/team-jobs"

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || "development_secret"}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // 1. Update stats for all teams
        await updateAllTeamStats()

        // 2. Recalculate rankings
        await calculateTeamRankings()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error running team cron:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
