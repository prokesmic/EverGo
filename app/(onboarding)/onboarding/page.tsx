import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"
import { SessionRefreshRedirect } from "@/components/onboarding/SessionRefreshRedirect"
import { getOnboardingData } from "@/lib/onboarding/actions"
import { ONBOARDING_SPORTS } from "@/lib/onboarding/sportsCatalog"

export const dynamic = "force-dynamic"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
    select: {
      id: true,
      onboardingCompleted: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  // If already completed onboarding, use client-side redirect that updates session first
  // This prevents redirect loops caused by stale JWT tokens
  if (user.onboardingCompleted) {
    return <SessionRefreshRedirect redirectTo="/home" />
  }

  // Fetch sports from DB and map to catalog
  const dbSports = await prisma.sport.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
    },
  })

  // Create a map of slug -> db sport
  const dbSportBySlug = new Map(dbSports.map((s) => [s.slug, s]))

  // Map catalog sports to include DB ids (strip icon as it's not serializable)
  const catalogSportsWithIds = ONBOARDING_SPORTS.filter((sport) =>
    dbSportBySlug.has(sport.slug)
  ).map((sport) => ({
    slug: sport.slug,
    label: sport.label,
    category: sport.category,
    tags: sport.tags,
    id: dbSportBySlug.get(sport.slug)!.id,
    dbName: dbSportBySlug.get(sport.slug)!.name,
  }))

  // Benchmarks removed in V6
  const benchmarks: { id: string; slug: string; name: string; unit: string; higherIsBetter: boolean }[] = []

  // Get any pre-existing user data to pre-fill
  const initialData = await getOnboardingData()

  return (
    <OnboardingWizard
      sports={catalogSportsWithIds}
      benchmarks={benchmarks}
      initialData={initialData || undefined}
    />
  )
}
