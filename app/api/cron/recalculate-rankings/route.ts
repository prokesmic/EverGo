import { NextRequest, NextResponse } from "next/server"
import { recalculateAllRankings } from "@/lib/rankings"
import { processIncrementalRankings, hasUnrankedActivities } from "@/lib/rankings-incremental"
import { verifyCronRequest } from "@/lib/cron"
import { updateAllTrustScores } from "@/lib/metrics/trustScore"
import { computeMultiSportIndex } from "@/lib/metrics/multisportIndex"
import { prisma } from "@/lib/db"

/**
 * Rankings Recalculation Cron
 *
 * V11: Includes MultiSport Index and Trust Score computation
 *
 * Uses incremental-first approach:
 * 1. Process only unranked activities (fast, most common case)
 * 2. Falls back to full recalculation if incremental fails or if forced
 * 3. Updates MultiSport Index for active users
 * 4. Updates Trust Scores for all users
 *
 * Query params:
 * - full=true: Force full recalculation (for maintenance/recovery)
 * - skipMultisport=true: Skip MultiSport Index computation
 * - skipTrust=true: Skip Trust Score computation
 */
export async function GET(request: NextRequest) {
    // Verify cron authentication
    const authError = verifyCronRequest(request)
    if (authError) return authError

    const forceFullRecalc = request.nextUrl.searchParams.get("full") === "true"
    const skipMultisport = request.nextUrl.searchParams.get("skipMultisport") === "true"
    const skipTrust = request.nextUrl.searchParams.get("skipTrust") === "true"

    const stats = {
        rankings: { mode: "skip", processed: 0 },
        multisport: { updated: 0 },
        trust: { updated: 0 },
    }

    try {
        // 1. Rankings update
        if (forceFullRecalc) {
            console.log("[Rankings Cron] Forced full recalculation")
            await recalculateAllRankings()
            stats.rankings = { mode: "full", processed: -1 }
        } else {
            const hasUnranked = await hasUnrankedActivities()
            if (hasUnranked) {
                const result = await processIncrementalRankings()
                stats.rankings = {
                    mode: "incremental",
                    processed: result.processedActivities,
                }
            }
        }

        // 2. MultiSport Index update (for users with recent activity)
        if (!skipMultisport) {
            const recentActiveUsers = await prisma.activity.findMany({
                where: {
                    activityDate: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                    },
                },
                select: { userId: true },
                distinct: ["userId"],
            })

            console.log(`[Rankings Cron] Updating MultiSport Index for ${recentActiveUsers.length} users`)

            for (const { userId } of recentActiveUsers) {
                try {
                    const result = await computeMultiSportIndex(userId)
                    await prisma.userStats.upsert({
                        where: { userId },
                        create: {
                            userId,
                            multisportIndex: result.index,
                            eligibleSportsCount: result.eligibleSports,
                        },
                        update: {
                            multisportIndex: result.index,
                            eligibleSportsCount: result.eligibleSports,
                        },
                    })
                    stats.multisport.updated++
                } catch (error) {
                    console.error(`[Rankings Cron] Failed to update MultiSport for ${userId}:`, error)
                }
            }
        }

        // 3. Trust Score update
        if (!skipTrust) {
            console.log("[Rankings Cron] Updating Trust Scores")
            stats.trust.updated = await updateAllTrustScores()
        }

        return NextResponse.json({
            success: true,
            stats,
            message: "Rankings cron completed",
        })
    } catch (error) {
        console.error("Error recalculating rankings:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
