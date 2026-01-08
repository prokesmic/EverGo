import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAppVersion } from "@/lib/observability"

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  const version = getAppVersion()

  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const dbTime = Date.now() - startTime

    // Check for recent cron runs (if table exists)
    let lastCronRun: string | null = null
    try {
      const cronRun = await prisma.cronJobRun.findFirst({
        where: { status: "COMPLETED" },
        orderBy: { finishedAt: "desc" },
        select: { jobName: true, finishedAt: true },
      })
      if (cronRun?.finishedAt) {
        lastCronRun = `${cronRun.jobName} @ ${cronRun.finishedAt.toISOString()}`
      }
    } catch {
      // Table may not exist yet
    }

    return NextResponse.json({
      status: "ok",
      version: version.version,
      commit: version.commit ?? null,
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: "connected",
          responseMs: dbTime,
          userCount,
        },
        cron: {
          lastRun: lastCronRun,
        },
      },
      config: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasCronSecret: !!process.env.CRON_SECRET,
        hasStravaClient: !!process.env.STRAVA_CLIENT_ID,
      }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json({
      status: "error",
      version: version.version,
      commit: version.commit ?? null,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: "error",
          error: errorMessage,
        },
      },
      config: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasCronSecret: !!process.env.CRON_SECRET,
        hasStravaClient: !!process.env.STRAVA_CLIENT_ID,
      }
    }, { status: 500 })
  }
}
