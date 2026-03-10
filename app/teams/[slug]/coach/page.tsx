import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { canAccessCoachDashboard, getTeamCoachDashboard } from "@/lib/elite/team-coach"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, Users } from "lucide-react"

export const dynamic = "force-dynamic"

interface TeamCoachPageProps {
  params: Promise<{ slug: string }>
}

export default async function TeamCoachPage({ params }: TeamCoachPageProps) {
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

  const { slug } = await params
  const team = await prisma.team.findUnique({ where: { slug }, select: { id: true } })
  if (!team) notFound()

  const allowed = await canAccessCoachDashboard(team.id, user.id)
  if (!allowed) {
    redirect(`/teams/${slug}`)
  }

  const dashboard = await getTeamCoachDashboard(slug)
  if (!dashboard) notFound()

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="eg-mode-shell eg-mode-competition rounded-2xl border p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Team Coach Mode
          </p>
          <h1 className="eg-display mt-1 text-3xl font-black text-foreground">{dashboard.team.name} Performance Command</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor compliance, schedule sessions, and drive team objectives.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-4">
          <CoachKpi label="Members On Track" value={`${dashboard.compliance.membersOnTrack}`} />
          <CoachKpi label="Total Members" value={`${dashboard.compliance.totalMembers}`} />
          <CoachKpi label="Weekly Session Target" value={`${dashboard.compliance.weeklySessionTarget}`} />
          <CoachKpi label="Avg Compliance" value={`${dashboard.compliance.avgCompletionPct}%`} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="eg-surface border-0">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                Member Compliance
                <Users className="h-4 w-4 text-primary" />
              </div>
              {dashboard.memberRows.map((row) => (
                <div key={row.userId} className="rounded-lg border border-border-light px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{row.displayName}</div>
                    <div className="text-sm text-muted-foreground">{row.sessionsThisWeek} sessions</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {row.role} • {row.completionPct}% completion
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="eg-surface border-0">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                Team Calendar
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              {dashboard.calendar.map((event) => (
                <div key={event.id} className="rounded-lg border border-border-light px-3 py-2">
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.startsAt).toLocaleString()} • {event.type}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="eg-surface border-0">
          <CardContent className="space-y-2 p-4">
            <div className="text-sm font-semibold">Active Team Objectives</div>
            {dashboard.objectives.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No active objectives. Create a team challenge to set one.
              </div>
            )}
            {dashboard.objectives.map((objective) => (
              <div key={objective.id} className="rounded-lg border border-border-light px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{objective.title}</div>
                  <div className="text-sm text-muted-foreground">{objective.progressPct}%</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round(objective.currentValue)} / {Math.round(objective.targetValue)} • ends{" "}
                  {new Date(objective.endsAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CoachKpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="eg-surface border-0">
      <CardContent className="p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="eg-kpi-value mt-2">{value}</div>
      </CardContent>
    </Card>
  )
}
