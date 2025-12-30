import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Swords, Plus, Trophy } from "lucide-react"
import { RivalryStatus } from "@prisma/client"
import { RivalriesListClient } from "./rivalries-list-client"

export const dynamic = "force-dynamic"

export default async function RivalriesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect("/login")
  }

  // Fetch all rivalries for user
  const rivalries = await prisma.rivalry.findMany({
    where: {
      participants: {
        some: { userId: user.id },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
    orderBy: [
      { status: "asc" }, // PENDING and ACTIVE first
      { createdAt: "desc" },
    ],
  })

  // Fetch sports for the drawer
  const sports = await prisma.sport.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
    },
    take: 10,
  })

  // Fetch user's sport ratings
  const sportRatings = await prisma.userSportRating.findMany({
    where: { userId: user.id },
    orderBy: { rating: "desc" },
  })

  // Count stats
  const activeCount = rivalries.filter((r) => r.status === RivalryStatus.ACTIVE).length
  const pendingCount = rivalries.filter((r) => r.status === RivalryStatus.PENDING).length
  const completedCount = rivalries.filter(
    (r) => r.status === RivalryStatus.COMPLETED
  ).length

  // Calculate wins/losses from completed rivalries
  let wins = 0
  let losses = 0
  let ties = 0

  rivalries
    .filter((r) => r.status === RivalryStatus.COMPLETED)
    .forEach((rivalry) => {
      const myParticipant = rivalry.participants.find((p) => p.userId === user.id)
      const opponent = rivalry.participants.find((p) => p.userId !== user.id)

      if (myParticipant && opponent) {
        const myScore = myParticipant.scoreValue ?? 0
        const theirScore = opponent.scoreValue ?? 0

        if (myScore > theirScore) wins++
        else if (theirScore > myScore) losses++
        else ties++
      }
    })

  return (
    <main className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Swords className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Rivalries</h1>
              <p className="text-orange-100 text-sm">
                1v1 competitions with friends
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{activeCount}</div>
              <div className="text-xs text-orange-100">Active</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{wins}</div>
              <div className="text-xs text-orange-100">Wins</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{losses}</div>
              <div className="text-xs text-orange-100">Losses</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">
                {wins + losses > 0
                  ? Math.round((wins / (wins + losses)) * 100)
                  : 0}
                %
              </div>
              <div className="text-xs text-orange-100">Win Rate</div>
            </div>
          </div>

          {/* Top Rating */}
          {sportRatings.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-orange-200" />
              <span className="text-orange-100">
                Top Rating: {sportRatings[0].rating} ({sportRatings[0].sportSlug})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <RivalriesListClient
          rivalries={rivalries}
          currentUserId={user.id}
          sports={sports}
          pendingCount={pendingCount}
        />
      </div>
    </main>
  )
}
