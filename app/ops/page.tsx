import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import {
  getExperimentAssignments,
  getOpsSLOSnapshot,
  getRetentionCohortSnapshot,
} from "@/lib/elite/ops"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function OpsPage() {
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

  const [assignments, slo, cohorts] = await Promise.all([
    Promise.resolve(getExperimentAssignments(user.id)),
    getOpsSLOSnapshot(),
    getRetentionCohortSnapshot(),
  ])

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="eg-mode-shell eg-mode-social rounded-2xl border p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Product OS
          </p>
          <h1 className="mt-1 text-3xl font-black text-foreground">Experiments, cohorts, and reliability</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Operational controls for elite product iteration and platform quality.
          </p>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Experiment Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {assignments.map((assignment) => (
                <div key={assignment.experiment} className="rounded-lg border border-border-light px-3 py-2">
                  <div className="font-semibold">{assignment.experiment}</div>
                  <div className="text-xs text-muted-foreground">
                    {assignment.variant} • {assignment.rationale}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SLO Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {slo.checks.map((check) => (
                <div key={check.name} className="rounded-lg border border-border-light px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{check.name}</div>
                    <div className="text-sm">{check.value}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{check.status}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Retention Cohorts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cohorts.slice(0, 8).map((cohort) => (
              <div key={cohort.cohort} className="rounded-lg border border-border-light px-3 py-2">
                <div className="font-semibold">{cohort.cohort}</div>
                <div className="text-xs text-muted-foreground">
                  Users: {cohort.users} • D1: {cohort.activeD1} • D7: {cohort.activeD7} • D30:{" "}
                  {cohort.activeD30}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
