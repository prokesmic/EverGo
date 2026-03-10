import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getReadinessSnapshot } from "@/lib/elite/readiness"
import { buildAdaptivePlan } from "@/lib/elite/adaptive-plan"
import { getExperimentAssignments } from "@/lib/elite/ops"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Shield, Timer, Zap } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CoachPage() {
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

  const [readiness, plan] = await Promise.all([
    getReadinessSnapshot(user.id),
    buildAdaptivePlan(user.id),
  ])
  const assignments = getExperimentAssignments(user.id)

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="eg-mode-shell eg-mode-recovery rounded-2xl border p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Adaptive Coach
          </p>
          <h1 className="eg-display mt-1 text-3xl font-black text-foreground">Train with readiness-aware guidance</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your daily plan adapts to fatigue, consistency, and competition schedule.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild className="rounded-full">
              <Link href={plan.primaryAction.href}>{plan.primaryAction.label}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/routes">Open Route Intelligence</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/goals">Open Goal OS</Link>
            </Button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="eg-surface border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Readiness
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="eg-kpi-value mt-2">{readiness.score}%</div>
              <div className="mt-1 text-sm text-muted-foreground">{readiness.band}</div>
            </CardContent>
          </Card>
          <Card className="eg-surface border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Objective
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-2 text-lg font-semibold">{plan.objective}</div>
              <div className="mt-1 text-sm text-muted-foreground">RPE {plan.recommendedRpe}</div>
            </CardContent>
          </Card>
          <Card className="eg-surface border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Planned Load
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="eg-kpi-value mt-2">{plan.estimatedLoadPoints}</div>
              <div className="mt-1 text-sm text-muted-foreground">{plan.volumeMinutes} min</div>
            </CardContent>
          </Card>
        </div>

        <Card className="eg-surface border-0">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Session Blocks</span>
              <Timer className="h-4 w-4 text-primary" />
            </div>
            {plan.blocks.map((block) => (
              <div
                key={block.label}
                className="flex items-center justify-between rounded-lg border border-border-light px-3 py-2"
              >
                <div className="text-sm font-medium">{block.label}</div>
                <div className="text-sm text-muted-foreground">{block.minutes} min</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="eg-surface border-0">
            <CardContent className="p-4 space-y-2">
              <div className="text-sm font-semibold">Why this plan</div>
              {(plan.rationale ?? []).slice(0, 3).map((item) => (
                <div key={item.label} className="rounded-lg border border-border-light px-3 py-2 text-sm">
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.detail}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="eg-surface border-0">
            <CardContent className="p-4 space-y-2">
              <div className="text-sm font-semibold">Coach Notes</div>
              {(plan.coachNotes ?? []).map((note) => (
                <div key={note} className="rounded-lg border border-border-light px-3 py-2 text-sm text-muted-foreground">
                  {note}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="eg-surface border-0">
          <CardContent className="space-y-2 p-4">
            <div className="text-sm font-semibold">Product OS Signals</div>
            {assignments.map((item) => (
              <div key={item.experiment} className="rounded-lg border border-border-light px-3 py-2">
                <div className="text-sm font-semibold">{item.experiment}</div>
                <div className="text-xs text-muted-foreground">
                  Variant: <span className="font-medium text-foreground">{item.variant}</span> • {item.rationale}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
