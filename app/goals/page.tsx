import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getGoalOSSummary } from "@/lib/elite/goals-os"
import { Card, CardContent } from "@/components/ui/card"
import { Gauge, ShieldCheck, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function GoalsPage() {
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

  const summary = await getGoalOSSummary(user.id)

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="eg-mode-shell eg-mode-competition rounded-2xl border p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Goal OS
          </p>
          <h1 className="eg-display mt-1 text-3xl font-black text-foreground">Turn goals into daily execution</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Forecasting, weekly targets, and recommended sessions based on live progress.
          </p>
          <div className="mt-4">
            <Button asChild className="rounded-full">
              <Link href="/coach">Open Adaptive Coach</Link>
            </Button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Weekly Target" value={`${summary.weeklyTargetActivities}`} suffix="sessions" />
          <MetricCard label="Completed" value={`${summary.currentActivities}`} suffix="sessions" />
          <MetricCard label="Completion" value={`${summary.completionPct}`} suffix="%" />
          <MetricCard label="Momentum" value={`${summary.momentumScore}`} suffix="score" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="eg-surface border-0">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                Forecast & Risk
                <Gauge className="h-4 w-4 text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Forecasted sessions</div>
                  <div className="font-semibold">{summary.forecastEndOfWeekActivities}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Confidence</div>
                  <div className="font-semibold">{summary.forecastConfidence}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Risk level</div>
                  <div className="font-semibold">{summary.riskLevel}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Sessions/day</div>
                  <div className="font-semibold">{summary.requiredSessionsPerRemainingDay}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="eg-pill">Slack {summary.slackDays} days</span>
                <span className="eg-pill eg-pill-good">Momentum {summary.momentumScore}</span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                {summary.rationale.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="eg-surface border-0">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                Recommended Session Plan
                <Timer className="h-4 w-4 text-primary" />
              </div>
            {summary.recommendedSessions.map((session) => (
              <div key={`${session.day}-${session.focus}`} className="rounded-lg border border-border-light px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{session.day}</div>
                  <div className="text-sm text-muted-foreground">{session.durationMinutes} min</div>
                </div>
                <div className="text-sm text-muted-foreground">{session.focus}</div>
                <div className="text-xs uppercase tracking-wide mt-1 font-semibold">{session.intensity}</div>
              </div>
            ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <Card className="eg-surface border-0">
      <CardContent className="p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="eg-kpi-value mt-2">
          {value}
          <span className="ml-1 text-base font-medium text-muted-foreground">{suffix}</span>
        </div>
      </CardContent>
    </Card>
  )
}
