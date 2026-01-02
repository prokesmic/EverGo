import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"
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

  // If already completed onboarding, redirect to home
  if (user.onboardingCompleted) {
    redirect("/home")
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

  // Map catalog sports to include DB ids
  const catalogSportsWithIds = ONBOARDING_SPORTS.filter((sport) =>
    dbSportBySlug.has(sport.slug)
  ).map((sport) => ({
    ...sport,
    id: dbSportBySlug.get(sport.slug)!.id,
    dbName: dbSportBySlug.get(sport.slug)!.name,
  }))

  // Fetch benchmark definitions for step 3
  const benchmarks = await prisma.benchmarkDefinition.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      unit: true,
      higherIsBetter: true,
    },
  })

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
