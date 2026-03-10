"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Activity,
  Brain,
  Compass,
  Gauge,
  Radar,
  Sparkles,
  Target,
  Timer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Mode = "competition" | "recovery" | "social"

interface EliteCommandCenterProps {
  mode?: Mode
}

type ReadinessPayload = {
  readiness: {
    score: number
    band: string
    recovery: { suggestedIntensity: string }
    drivers: string[]
  }
}

type AdaptivePlanPayload = {
  plan: {
    objective: string
    estimatedLoadPoints: number
    primaryAction: { label: string; href: string }
    blocks: Array<{ label: string; minutes: number }>
  }
}

type LivePayload = {
  items: Array<{
    id: string
    kind: string
    title: string
    status: string
    delta: number
    finishProbability: number
  }>
}

type GoalPayload = {
  summary: {
    weeklyTargetActivities: number
    currentActivities: number
    completionPct: number
    forecastConfidence: number
  }
}

export function EliteCommandCenter({ mode = "competition" }: EliteCommandCenterProps) {
  const [readiness, setReadiness] = useState<ReadinessPayload["readiness"] | null>(null)
  const [plan, setPlan] = useState<AdaptivePlanPayload["plan"] | null>(null)
  const [live, setLive] = useState<LivePayload["items"]>([])
  const [goal, setGoal] = useState<GoalPayload["summary"] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [readinessRes, planRes, liveRes, goalRes] = await Promise.all([
          fetch("/api/me/readiness"),
          fetch("/api/me/adaptive-plan"),
          fetch("/api/competition/live"),
          fetch("/api/goals/os"),
        ])

        if (!mounted) return
        if (readinessRes.ok) {
          const json = (await readinessRes.json()) as ReadinessPayload
          setReadiness(json.readiness)
        }
        if (planRes.ok) {
          const json = (await planRes.json()) as AdaptivePlanPayload
          setPlan(json.plan)
        }
        if (liveRes.ok) {
          const json = (await liveRes.json()) as LivePayload
          setLive(json.items ?? [])
        }
        if (goalRes.ok) {
          const json = (await goalRes.json()) as GoalPayload
          setGoal(json.summary)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    const poll = setInterval(load, 30_000)
    return () => {
      mounted = false
      clearInterval(poll)
    }
  }, [])

  const primaryAction = plan?.primaryAction ?? { label: "Start Session", href: "/activity/create" }
  const topBattle = live[0]

  const modeClass = useMemo(
    () =>
      mode === "competition"
        ? "eg-mode-competition"
        : mode === "recovery"
          ? "eg-mode-recovery"
          : "eg-mode-social",
    [mode]
  )

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("eg-mode-shell rounded-2xl border p-5 md:p-6", modeClass)}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Elite Command Center
          </div>
          <h2 className="mt-1 text-2xl font-black leading-tight text-foreground">
            Adaptive coaching, readiness, and live competition
          </h2>
        </div>
        <Button asChild className="h-11 rounded-full px-6 font-semibold shadow-lg">
          <Link href={primaryAction.href}>{primaryAction.label}</Link>
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Gauge className="h-4 w-4" />}
          label="Readiness"
          value={loading ? "..." : `${readiness?.score ?? 0}%`}
          sub={readiness?.band ?? "Baseline"}
        />
        <StatCard
          icon={<Brain className="h-4 w-4" />}
          label="Adaptive Plan"
          value={plan ? `${plan.estimatedLoadPoints} load` : "..."}
          sub={plan?.objective ?? "Generating plan"}
        />
        <StatCard
          icon={<Target className="h-4 w-4" />}
          label="Goal OS"
          value={goal ? `${goal.completionPct}%` : "..."}
          sub={
            goal
              ? `${goal.currentActivities}/${goal.weeklyTargetActivities} sessions this week`
              : "Forecasting"
          }
        />
        <StatCard
          icon={<Radar className="h-4 w-4" />}
          label="Live Competition"
          value={topBattle ? `${topBattle.finishProbability}%` : "No battle"}
          sub={topBattle ? topBattle.title : "Join challenge or rivalry"}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-background/80 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Today&apos;s Intent
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {readiness?.drivers?.[0] ?? "Balancing performance and recovery."}
          </p>
          <div className="mt-3 text-xs text-muted-foreground">
            Suggested intensity: <span className="font-semibold text-foreground">{readiness?.recovery.suggestedIntensity ?? "EASY"}</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/80 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Timer className="h-4 w-4 text-primary" />
            Session Blocks
          </div>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {(plan?.blocks ?? []).slice(0, 3).map((block) => (
              <li key={block.label} className="flex items-center justify-between">
                <span>{block.label}</span>
                <span className="font-semibold text-foreground">{block.minutes} min</span>
              </li>
            ))}
            {!plan?.blocks?.length && <li>Preparing your session structure...</li>}
          </ul>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/80 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Compass className="h-4 w-4 text-primary" />
            Next Actions
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href="/coach">Open Coach</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href="/goals">View Goal OS</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href="/routes">Route Intelligence</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href="/activity/track">
                <Activity className="mr-1 h-3.5 w-3.5" />
                Start GPS
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/85 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-3xl font-black leading-none text-foreground">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  )
}
