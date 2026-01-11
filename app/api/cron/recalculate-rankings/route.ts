import { NextRequest, NextResponse } from "next/server"
import { recalculateAllRankings } from "@/lib/rankings"
import { processIncrementalRankings, hasUnrankedActivities } from "@/lib/rankings-incremental"
import { verifyCronRequest } from "@/lib/cron"

/**
 * Rankings Recalculation Cron
 *
 * V10: Uses incremental-first approach:
 * 1. Process only unranked activities (fast, most common case)
 * 2. Falls back to full recalculation if incremental fails or if forced
 *
 * Query params:
 * - full=true: Force full recalculation (for maintenance/recovery)
 */
export async function GET(request: NextRequest) {
    // Verify cron authentication
    const authError = verifyCronRequest(request)
    if (authError) return authError

    const forceFullRecalc = request.nextUrl.searchParams.get("full") === "true"

    try {
        if (forceFullRecalc) {
            console.log("[Rankings Cron] Forced full recalculation")
            await recalculateAllRankings()
            return NextResponse.json({
                success: true,
                mode: "full",
                message: "Full rankings recalculation completed"
            })
        }

        // Try incremental first
        const hasUnranked = await hasUnrankedActivities()

        if (hasUnranked) {
            const result = await processIncrementalRankings()
            return NextResponse.json({
                success: true,
                mode: "incremental",
                message: "Incremental rankings update completed",
                stats: {
                    processedActivities: result.processedActivities,
                    affectedUsers: result.affectedUsers,
                    rerankedScopes: result.rerankedScopes.length
                }
            })
        } else {
            console.log("[Rankings Cron] No unranked activities, skipping")
            return NextResponse.json({
                success: true,
                mode: "skip",
                message: "No unranked activities to process"
            })
        }
    } catch (error) {
        console.error("Error recalculating rankings:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
