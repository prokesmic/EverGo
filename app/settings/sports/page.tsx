import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getMySports } from "@/lib/mySports"
import { getAllSports } from "@/lib/sports"
import { MySportsManager } from "@/components/settings/MySportsManager"
import { SubscriptionStatus, SubscriptionPlan } from "@prisma/client"

export const dynamic = 'force-dynamic'

export default async function SportsSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      benchmarkBests: {
        select: {
          benchmarkId: true,
          value: true,
          achievedAt: true
        }
      }
    },
  })

  if (!user) {
    redirect("/login")
  }

  // Get user's sports data
  const mySportsData = await getMySports(user.id)

  // Get all available sports
  const allSports = await getAllSports()

  // Fetch benchmark definitions for PB display
  const benchmarkDefinitions = await prisma.benchmarkDefinition.findMany({
    where: { isActive: true },
    select: {
      id: true,
      sportId: true,
      slug: true,
      name: true,
      measurementType: true,
      unit: true,
      higherIsBetter: true,
    }
  })

  // Check subscription status
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { status: true, plan: true },
  })

  const isPro = subscription?.status === SubscriptionStatus.ACTIVE &&
    (subscription?.plan === SubscriptionPlan.PRO || subscription?.plan === SubscriptionPlan.PRO_ANNUAL)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Sports Settings</h1>
        <p className="text-slate-500 mt-1">
          Manage your sports, set your primary, and control your skill levels
        </p>
        {!isPro && (
          <p className="text-sm text-orange-600 mt-2">
            Free users can have up to 3 active sports.{" "}
            <a href="/settings/subscription" className="underline font-medium">
              Upgrade to Pro
            </a>{" "}
            for unlimited.
          </p>
        )}
      </div>

      <div className="p-6">
        <MySportsManager
          initialData={mySportsData}
          allSports={allSports}
          isPro={isPro}
          benchmarkDefinitions={benchmarkDefinitions}
          userBenchmarkBests={user.benchmarkBests}
        />
      </div>
    </div>
  )
}
