import Link from "next/link"
import { Globe, MapPin, Building2, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserRankScopes, RankScopeData } from "@/lib/leaderboards"

type ScopeType = "global" | "country" | "city" | "team"

const scopeConfig: Record<ScopeType, {
  icon: typeof Globe
  label: string
  color: string
  href: (data: RankScopeData) => string
}> = {
  global: {
    icon: Globe,
    label: "Global",
    color: "text-emerald-400",
    href: () => "/rankings?scope=global",
  },
  country: {
    icon: MapPin,
    label: "Country",
    color: "text-sky-400",
    href: (data) => `/rankings?scope=country${data.scopeValue ? `&country=${encodeURIComponent(data.scopeValue)}` : ""}`,
  },
  city: {
    icon: Building2,
    label: "City",
    color: "text-amber-400",
    href: (data) => `/rankings?scope=city${data.scopeValue ? `&city=${encodeURIComponent(data.scopeValue)}` : ""}`,
  },
  team: {
    icon: Users,
    label: "Team",
    color: "text-violet-400",
    href: (data) => `/rankings?scope=team${data.scopeValue ? `&teamId=${encodeURIComponent(data.scopeValue)}` : ""}`,
  },
}

function RankPill({
  scope,
  data
}: {
  scope: ScopeType
  data: RankScopeData
}) {
  const config = scopeConfig[scope]
  const Icon = config.icon

  return (
    <Link
      href={config.href(data)}
      className={cn(
        "group flex items-center gap-1.5 px-2 py-1 rounded-lg",
        "bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10",
        "transition-all hover:border-white/20 hover:-translate-y-0.5"
      )}
    >
      <Icon className={cn("w-3 h-3", config.color)} />
      <div className="flex flex-col min-w-[36px]">
        <span className="text-[10px] text-slate-400 leading-tight">
          {data.scopeValue || config.label}
        </span>
        {data.rank !== null ? (
          <span className="text-sm font-bold text-white tabular-nums leading-tight">
            #{data.rank.toLocaleString()}
          </span>
        ) : (
          <span className="text-[10px] text-slate-500 leading-tight">
            {data.missingField === "country" && "Add location"}
            {data.missingField === "city" && "Add city"}
            {data.missingField === "team" && "Join team"}
            {!data.missingField && "-"}
          </span>
        )}
      </div>
    </Link>
  )
}

interface RankStripProps {
  ranks: UserRankScopes
  className?: string
}

/**
 * RankStrip - Desktop-only compact display of all 4 rank scopes
 * Shows as a 2x2 grid in the hero overlay area
 */
export function RankStrip({ ranks, className }: RankStripProps) {
  return (
    <div
      className={cn("hidden lg:grid grid-cols-2 gap-1.5", className)}
      data-testid="rank-strip"
    >
      <RankPill scope="global" data={ranks.global} />
      <RankPill scope="country" data={ranks.country} />
      <RankPill scope="city" data={ranks.city} />
      <RankPill scope="team" data={ranks.team} />
    </div>
  )
}
