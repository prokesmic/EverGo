"use client"

/**
 * V6 Quick Actions Widget
 *
 * Primary actions available from home page sidebar
 * Redesigned as 2x2 grid with consistent semantic styling
 */

import { Plus, Trophy, UserSearch, Swords } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ActionTile {
  href: string
  icon: React.ElementType
  label: string
  primary?: boolean
}

const ACTIONS: ActionTile[] = [
  { href: "/activity/create", icon: Plus, label: "Log Activity", primary: true },
  { href: "/gauntlets/new", icon: Swords, label: "Throw Gauntlet" },
  { href: "/rankings", icon: Trophy, label: "Rankings" },
  { href: "/gauntlets/opponents", icon: UserSearch, label: "Find Opponent" },
]

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-semibold text-card-foreground mb-3">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((action) => (
          <Link key={action.href} href={action.href}>
            <ActionTileButton
              icon={action.icon}
              label={action.label}
              primary={action.primary}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}

function ActionTileButton({
  icon: Icon,
  label,
  primary,
}: {
  icon: React.ElementType
  label: string
  primary?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-colors",
        "border border-border",
        primary
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-muted/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className={cn("w-5 h-5", primary ? "text-primary-foreground" : "text-primary")} />
      <span className="text-xs font-medium text-center leading-tight">{label}</span>
    </div>
  )
}
