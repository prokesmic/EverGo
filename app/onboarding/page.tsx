import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"
import { getOnboardingData } from "@/lib/onboarding/actions"

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

  // Fetch available sports for selection
  const sports = await prisma.sport.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      category: true,
    },
  })

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
      sports={sports}
      benchmarks={benchmarks}
      initialData={initialData || undefined}
    />
  )
}
