import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { BenchmarksOnboarding } from "@/components/benchmarks/BenchmarksOnboarding"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default async function BenchmarksOnboardingPage() {
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

  // Find user's primary sport
  const primarySport = await prisma.userSport.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE",
      priority: 0,
    },
    include: { sport: true },
  })

  // If no primary sport, redirect to sports selection
  if (!primarySport) {
    redirect("/onboarding/sports")
  }

  // Get benchmark definitions for this sport
  const benchmarkDefs = await prisma.benchmarkDefinition.findMany({
    where: {
      sportId: primarySport.sportId,
      isActive: true,
    },
    orderBy: [{ rankWeight: "desc" }, { name: "asc" }],
    take: 5,
  })

  // Get user's existing PBs
  const userPbs = await prisma.userBenchmarkBest.findMany({
    where: {
      userId: user.id,
      benchmarkId: { in: benchmarkDefs.map((d) => d.id) },
    },
  })

  const pbsByBenchmarkId = new Map(userPbs.map((pb) => [pb.benchmarkId, pb]))

  const benchmarksWithPbs = benchmarkDefs.map((def) => ({
    id: def.id,
    name: def.name,
    measurementType: def.measurementType,
    unit: def.unit,
    higherIsBetter: def.higherIsBetter,
    rankWeight: def.rankWeight,
    userPb: pbsByBenchmarkId.get(def.id) ?? null,
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/onboarding/sports">
            <Button variant="ghost" size="sm" className="gap-1 text-slate-500">
              <ChevronLeft className="w-4 h-4" />
              Back to Sports
            </Button>
          </Link>
        </div>

        <BenchmarksOnboarding
          sport={{ id: primarySport.sportId, name: primarySport.sport.name }}
          benchmarks={benchmarksWithPbs}
        />
      </div>
    </div>
  )
}
