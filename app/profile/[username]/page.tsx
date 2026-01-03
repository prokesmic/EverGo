import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ProfileHeaderHero } from "@/components/profile/ProfileHeaderHero"
import { ProfileStatsPills } from "@/components/profile/ProfileStatsPills"
import { ActivityFeedV2 } from "@/components/profile/ActivityFeedV2"
import { ProfileSideRail } from "@/components/profile/ProfileSideRail"
import { getHeroForUserPrimarySport } from "@/lib/hero/getHeroForUserPrimarySport"
export const dynamic = "force-dynamic"

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions)
  const { username: rawUsername } = await params

  // Decode URL-encoded username (e.g., admin%40evergo.app -> admin@evergo.app)
  const username = decodeURIComponent(rawUsername)

  // Handle "me" route - redirect to current user's profile
  if (username === "me") {
    if (!session?.user?.email) {
      redirect("/login")
    }
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { username: true, id: true },
    })
    if (currentUser) {
      redirect(`/profile/${currentUser.id}`)
    }
  }

  // Fetch user data with all necessary relations
  let user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          activities: true,
        },
      },
      sports: {
        where: { status: "ACTIVE" },
        orderBy: { priority: "asc" },
        include: {
          sport: true,
        },
      },
      activities: {
        orderBy: {
          activityDate: "desc",
        },
        take: 50,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatarUrl: true,
            },
          },
          discipline: {
            include: {
              sport: true,
            },
          },
        },
      },
      personalRecords: {
        orderBy: {
          achievedAt: "desc",
        },
        take: 5,
        include: {
          discipline: {
            include: {
              sport: true,
            },
          },
        },
      },
      followers: {
        where: {
          follower: {
            email: session?.user?.email || "",
          },
        },
        select: { id: true },
      },
      stats: true,
    },
  })

  // If not found by username, try by user ID
  if (!user) {
    user = await prisma.user.findFirst({
      where: {
        OR: [{ id: username }, { email: { equals: username, mode: "insensitive" } }],
      },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            activities: true,
          },
        },
        sports: {
          where: { status: "ACTIVE" },
          orderBy: { priority: "asc" },
          include: {
            sport: true,
          },
        },
        activities: {
          orderBy: {
            activityDate: "desc",
          },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatarUrl: true,
              },
            },
            discipline: {
              include: {
                sport: true,
              },
            },
          },
        },
        personalRecords: {
          orderBy: {
            achievedAt: "desc",
          },
          take: 5,
          include: {
            discipline: {
              include: {
                sport: true,
              },
            },
          },
        },
        followers: {
          where: {
            follower: {
              email: session?.user?.email || "",
            },
          },
          select: { id: true },
        },
        stats: true,
      },
    })
  }

  if (!user) {
    notFound()
  }

  const isCurrentUser = session?.user?.email === user.email
  const isFollowing = user.followers.length > 0

  // Get hero image based on user's primary sport
  const hero = await getHeroForUserPrimarySport(user.id)

  // Calculate Weekly Stats
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const weeklyActivities = user.activities.filter(
    (a) => new Date(a.activityDate) >= sevenDaysAgo
  )

  let weeklyDistance = 0
  let weeklyTime = 0

  weeklyActivities.forEach((activity) => {
    weeklyDistance += activity.distanceMeters ? activity.distanceMeters / 1000 : 0
    weeklyTime += activity.durationSeconds ? activity.durationSeconds / 60 : 0
  })

  // Fetch user teams
  const userTeams = await prisma.teamMember.findMany({
    where: { userId: user.id },
    include: {
      team: {
        include: {
          sport: true,
          _count: { select: { members: true } },
        },
      },
    },
    take: 3,
  })

  const formattedTeams = userTeams.map((tm) => ({
    id: tm.team.id,
    name: tm.team.name,
    sport: tm.team.sport.name,
    logoUrl: tm.team.logoUrl,
    memberCount: tm.team._count.members,
  }))

  // Format personal records
  const formattedPRs = user.personalRecords.map((pr) => {
    // PersonalRecord has value and unit fields, format accordingly
    let displayValue = `${pr.value} ${pr.unit}`

    // Format time values nicely if the unit suggests it's a time
    if (pr.unit.toLowerCase().includes("sec") || pr.recordType.includes("TIME")) {
      const totalSeconds = Math.round(pr.value)
      const h = Math.floor(totalSeconds / 3600)
      const m = Math.floor((totalSeconds % 3600) / 60)
      const s = totalSeconds % 60
      displayValue = h > 0
        ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
        : `${m}:${s.toString().padStart(2, "0")}`
    }

    // Check if this PR is from the last 7 days
    const isRecent = new Date(pr.achievedAt).getTime() > sevenDaysAgo.getTime()

    return {
      id: pr.id,
      discipline: pr.discipline.name,
      value: displayValue,
      achievedAt: pr.achievedAt,
      isRecent,
    }
  })

  // Format activities for feed
  const formattedActivities = user.activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    activityDate: activity.activityDate,
    distanceMeters: activity.distanceMeters,
    durationSeconds: activity.durationSeconds,
    elevationGainMeters: activity.elevationGain,
    avgHeartRate: activity.avgHeartRate,
    caloriesBurned: activity.caloriesBurned,
    avgPaceSecondsPerKm: activity.avgPace,
    mapThumbnailUrl: activity.mapImageUrl,
    user: activity.user,
    discipline: activity.discipline,
    _count: { kudos: 0, comments: 0 }, // Activity model doesn't have these relations yet
  }))

  return (
    <main className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* Full-Width Hero Header */}
      <ProfileHeaderHero
        user={{
          id: user.id,
          displayName: user.displayName,
          username: user.username,
          avatarUrl: user.avatarUrl,
          city: user.city,
          bio: user.bio,
          createdAt: user.createdAt,
        }}
        stats={{
          followers: user._count.followers,
          following: user._count.following,
          activities: user._count.activities,
        }}
        hero={hero}
        isCurrentUser={isCurrentUser}
        isFollowing={isFollowing}
      />

      {/* Stats Pills Strip */}
      <ProfileStatsPills
        sportIndex={user.stats?.sportIndex ?? undefined}
        sportIndexTrend={38}
        streakDays={14}
        weeklyDistance={weeklyDistance}
        weeklyTime={weeklyTime}
        weeklyActivities={weeklyActivities.length}
        globalRank={user.stats?.globalRank ?? undefined}
        cityRank={user.stats?.cityRank ?? undefined}
      />

      {/* Main Content Grid: 12 columns */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Column: Activity Feed (8 cols) */}
          <div className="lg:col-span-8">
            <ActivityFeedV2 activities={formattedActivities} showUserOnCards={false} />
          </div>

          {/* Sidebar (4 cols) - Sticky */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-20">
              <ProfileSideRail
                personalRecords={formattedPRs}
                teams={formattedTeams}
                userId={user.id}
                username={user.username}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
