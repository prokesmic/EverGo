"use client"

/**
 * Trophy Room Component
 *
 * Displays partner perks with unlock status based on Sport Index.
 *
 * Updated to match schema: Perk model with title, category, minSportIndex, partnerName
 */

import { cn } from "@/lib/utils"
import { Trophy, Lock, Gift, Star, Award } from "lucide-react"
import type { Perk, PerkCategory } from "@/lib/perks"

interface TrophyRoomProps {
  categories: PerkCategory[]
  nextPerk: { perk: Perk; progress: number } | null
  className?: string
}

export function TrophyRoom({ categories, nextPerk, className }: TrophyRoomProps) {
  return (
    <div className={cn("space-y-6", className)} data-testid="trophy-room">
      {/* Next unlock progress */}
      {nextPerk && (
        <div className="rounded-xl border p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Gift className="h-6 w-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{nextPerk.perk.title}</h3>
              <p className="text-xs text-muted-foreground">
                Unlocks at Sport Index {nextPerk.perk.minSportIndex ?? 0}
              </p>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                  style={{ width: `${nextPerk.progress}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-amber-500">
                {Math.round(nextPerk.progress)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Perk categories */}
      {categories.map((category) => (
        <div key={category.name}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CategoryIcon name={category.name} />
            {category.name}
            <span className="text-sm font-normal text-muted-foreground">
              ({category.perks.filter((p) => p.isUnlocked).length}/{category.perks.length})
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {category.perks.map((perk) => (
              <PerkCard key={perk.id} perk={perk} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PerkCard({ perk }: { perk: Perk }) {
  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 transition-all",
        perk.isUnlocked
          ? "bg-card hover:bg-muted/50 border-border"
          : "bg-muted/30 border-dashed border-muted-foreground/30"
      )}
    >
      {/* Lock overlay for locked perks */}
      {!perk.isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
          <div className="text-center">
            <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
            <span className="text-xs text-muted-foreground">
              SI {perk.minSportIndex ?? 0}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center text-center gap-2">
        {perk.imageUrl ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden">
            <img
              src={perk.imageUrl}
              alt={perk.title}
              className={cn(
                "w-full h-full object-cover",
                !perk.isUnlocked && "grayscale opacity-50"
              )}
            />
          </div>
        ) : (
          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              perk.isUnlocked ? "bg-primary/10" : "bg-muted"
            )}
          >
            <Gift
              className={cn(
                "h-6 w-6",
                perk.isUnlocked ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>
        )}
        <h3 className="font-medium text-sm line-clamp-2">{perk.title}</h3>
        {perk.partnerName && (
          <span className="text-[10px] text-muted-foreground">
            by {perk.partnerName}
          </span>
        )}
      </div>
    </div>
  )
}

function CategoryIcon({ name }: { name: string }) {
  const iconClass = "h-5 w-5 text-primary"
  switch (name) {
    case "GEAR":
      return <Award className={iconClass} />
    case "NUTRITION":
      return <Star className={iconClass} />
    case "TRAINING":
      return <Trophy className={iconClass} />
    case "RECOVERY":
      return <Gift className={iconClass} />
    default:
      return <Gift className={iconClass} />
  }
}

/**
 * Mini trophy display for profile/home
 */
interface MiniTrophyDisplayProps {
  unlockedCount: number
  totalCount: number
  nextPerk: { perk: Perk; progress: number } | null
  className?: string
}

export function MiniTrophyDisplay({
  unlockedCount,
  totalCount,
  nextPerk,
  className,
}: MiniTrophyDisplayProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border bg-card",
        className
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
        <Gift className="h-5 w-5 text-amber-500" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Perks</span>
          <span className="text-xs text-muted-foreground">
            {unlockedCount}/{totalCount}
          </span>
        </div>
        {nextPerk && (
          <div className="mt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate max-w-[120px]">
                {nextPerk.perk.title}
              </span>
              <span className="text-amber-500">{Math.round(nextPerk.progress)}%</span>
            </div>
            <div className="mt-0.5 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${nextPerk.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
