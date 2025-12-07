import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
    include: {
      sports: {
        include: {
          sport: true
        }
      }
    }
  })

  if (!user) {
    redirect("/login")
  }

  // If already completed onboarding, redirect to home
  // TODO: Add onboardingCompleted field to User model
  // if (user.onboardingCompleted) {
  //   redirect("/home")
  // }

  // Fetch available sports for selection
  const sports = await prisma.sport.findMany({
    orderBy: {
      name: "asc"
    }
  })

  // Fetch suggested users (same city, similar sports)
  const suggestedUsers = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: user.id } },
        { city: user.city || undefined },
      ]
    },
    take: 10,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      city: true,
      sports: {
        include: {
          sport: true
        }
      }
    }
  })

  // Fetch suggested communities
  const suggestedCommunities = await prisma.community.findMany({
    where: {
      OR: [
        { city: user.city || undefined },
        { isPublic: true }
      ]
    },
    take: 6,
    include: {
      sport: true,
      _count: {
        select: {
          members: true
        }
      }
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-green">
      <OnboardingFlow
        user={user}
        sports={sports}
        suggestedUsers={suggestedUsers}
        suggestedCommunities={suggestedCommunities}
      />
    </div>
  )
}
