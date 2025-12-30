"use client"

import { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface EmptyStateCardProps {
  title: string
  description: string
  icon?: LucideIcon
  primaryCta?: {
    label: string
    href: string
  }
  secondaryCta?: {
    label: string
    href: string
  }
  className?: string
  variant?: "default" | "compact" | "inline"
}

export function EmptyStateCard({
  title,
  description,
  icon: Icon,
  primaryCta,
  secondaryCta,
  className,
  variant = "default",
}: EmptyStateCardProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-4 p-4", className)}>
        {Icon && (
          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-slate-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
        {primaryCta && (
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 shrink-0" asChild>
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
        )}
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className={cn("text-center py-6", className)}>
        {Icon && (
          <Icon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
        )}
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
        {primaryCta && (
          <Button size="sm" variant="link" className="mt-2 text-orange-500" asChild>
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className={cn("p-8 rounded-2xl shadow-sm border bg-white", className)}>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6 text-slate-500" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>

          {(primaryCta || secondaryCta) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {primaryCta && (
                <Button className="bg-orange-500 hover:bg-orange-600" asChild>
                  <Link href={primaryCta.href}>{primaryCta.label}</Link>
                </Button>
              )}
              {secondaryCta && (
                <Button variant="outline" asChild>
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// Preset empty states for common scenarios
export function EmptyActivitiesState() {
  return (
    <EmptyStateCard
      title="No activities yet"
      description="Log your first workout to start tracking your progress and competing with others."
      primaryCta={{ label: "Log Activity", href: "/activity/create" }}
      secondaryCta={{ label: "Browse Activities", href: "/discover" }}
    />
  )
}

export function EmptyEventsState() {
  return (
    <EmptyStateCard
      title="No upcoming events"
      description="Find races, group rides, or training sessions in your area."
      primaryCta={{ label: "Browse Events", href: "/calendar" }}
      secondaryCta={{ label: "Create Event", href: "/calendar" }}
    />
  )
}

export function EmptyTeamsState() {
  return (
    <EmptyStateCard
      title="No teams yet"
      description="Join a team to train together and compete in challenges."
      primaryCta={{ label: "Explore Teams", href: "/teams" }}
      secondaryCta={{ label: "Create Team", href: "/teams/create" }}
    />
  )
}

export function EmptyRankingsState() {
  return (
    <EmptyStateCard
      title="No rankings available"
      description="Log activities to see where you rank among other athletes in your area."
      primaryCta={{ label: "Log Activity", href: "/activity/create" }}
      secondaryCta={{ label: "View Rankings", href: "/rankings" }}
    />
  )
}

export function EmptyFeedState() {
  return (
    <EmptyStateCard
      title="Your feed is empty"
      description="Follow other athletes to see their activities and updates here."
      primaryCta={{ label: "Find Athletes", href: "/discover" }}
      secondaryCta={{ label: "Invite Friends", href: "/invite" }}
    />
  )
}

export function EmptyFollowersState() {
  return (
    <EmptyStateCard
      title="No followers yet"
      description="Share your profile and activities to attract followers."
      variant="compact"
    />
  )
}

export function EmptyChallengesState() {
  return (
    <EmptyStateCard
      title="No active challenges"
      description="Join a challenge to push your limits and compete with others."
      primaryCta={{ label: "Browse Challenges", href: "/challenges" }}
      secondaryCta={{ label: "Create Challenge", href: "/challenges/create" }}
    />
  )
}

export function EmptyPersonalRecordsState() {
  return (
    <EmptyStateCard
      title="No personal records"
      description="Log activities to start tracking your personal bests."
      variant="compact"
      primaryCta={{ label: "Log Activity", href: "/activity/create" }}
    />
  )
}
