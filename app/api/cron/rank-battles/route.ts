import { NextRequest } from "next/server"
import { matchRankBattles, finalizeBattles } from "@/lib/rank-battles"
import { verifyCronRequest, runCronJob, isDryRun } from "@/lib/cron"

/**
 * Weekly Rank Battles Cron Job
 *
 * Handles two operations:
 * 1. Match new battles at week start (Monday)
 * 2. Finalize ended battles
 *
 * Schedule: Daily at 6 AM UTC
 * - On Mondays: matches new battles
 * - Every day: finalizes any ended battles
 */
export async function GET(request: NextRequest) {
  const authError = verifyCronRequest(request)
  if (authError) return authError

  const dryRun = isDryRun(request)

  return runCronJob(
    { jobName: "rank-battles", dryRun },
    async () => {
      // Finalize any ended battles first
      await finalizeBattles()

      // Match new battles (idempotent - won't duplicate if already matched this week)
      const matchedCount = await matchRankBattles()

      return {
        recordsProcessed: matchedCount,
        recordsUpdated: matchedCount,
        stats: {
          battlesMatched: matchedCount,
        },
      }
    }
  )
}
