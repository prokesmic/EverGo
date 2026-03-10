import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getGoalOSSummary } from "@/lib/elite/goals-os"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
          <h1 className="mt-1 text-3xl font-black text-foreground">Turn goals into daily execution</h1>
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
          <MetricCard label="Forecast Confidence" value={`${summary.forecastConfidence}`} suffix="%" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Session Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
  )
}

function MetricCard({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black">
          {value}
          <span className="ml-1 text-base font-medium text-muted-foreground">{suffix}</span>
        </div>
      </CardContent>
    </Card>
  )
}
