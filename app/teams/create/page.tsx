import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { GradientHeader } from "@/components/ui/frosted-card"
import { Users } from "lucide-react"
import CreateTeamClient from "@/components/teams/create-team-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function CreateTeamPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/teams/create")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    redirect("/login?callbackUrl=/teams/create")
  }

  // Safe fetch with try/catch - never throw on page load
  let sports: { id: string; slug: string; name: string; category: string }[] = []
  try {
    sports = await prisma.sport.findMany({
      select: { id: true, slug: true, name: true, category: true },
      orderBy: { name: "asc" },
    })
  } catch (e) {
    console.error("[teams/create] Failed to load sports:", e)
    // Continue with empty sports - client will show message
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container max-w-3xl py-8 px-4 md:px-6">
        <GradientHeader
          icon={<Users className="w-6 h-6" />}
          title="Create Team"
          description="Start a team, invite friends, and compete together"
        />

        <div className="mt-6 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/50 p-6 md:p-8">
          <CreateTeamClient sports={sports} />
        </div>
      </div>
    </div>
  )
}
