import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { StravaIntegration } from "@/components/settings/StravaIntegration"

export const dynamic = "force-dynamic"

export default async function IntegrationsSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    redirect("/login")
  }

  // Get Strava connection status
  const stravaConnection = await prisma.stravaConnection.findUnique({
    where: { userId: user.id },
    select: {
      isActive: true,
      lastSyncAt: true,
      lastBackfillAt: true,
      createdAt: true,
      athleteId: true,
    },
  })

  // Count imported activities
  let stravaActivityCount = 0
  if (stravaConnection?.isActive) {
    stravaActivityCount = await prisma.activity.count({
      where: {
        userId: user.id,
        source: "IMPORT_STRAVA",
        isHidden: false,
      },
    })
  }

  // Check if Strava is configured
  const isStravaConfigured = !!(
    process.env.AUTH_STRAVA_ID && process.env.AUTH_STRAVA_SECRET
  )

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="text-slate-500 mt-1">
          Connect external services to automatically sync your activities
        </p>
      </div>

      <div className="p-6 space-y-6">
        <StravaIntegration
          isConnected={stravaConnection?.isActive ?? false}
          lastSyncAt={stravaConnection?.lastSyncAt?.toISOString() ?? null}
          connectedAt={stravaConnection?.createdAt?.toISOString() ?? null}
          activityCount={stravaActivityCount}
          isConfigured={isStravaConfigured}
        />

        {/* Future integrations */}
        <div className="border border-dashed border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-400">G</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-400">Garmin Connect</h3>
                <p className="text-sm text-slate-400">Coming soon</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-400 text-sm rounded-full">
              Coming Soon
            </span>
          </div>
        </div>

        <div className="border border-dashed border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-400">A</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-400">Apple Health</h3>
                <p className="text-sm text-slate-400">Coming soon</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-400 text-sm rounded-full">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
