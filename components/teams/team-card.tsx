import Link from "next/link"
import { Trophy, Users, MapPin, ChevronRight, BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { SportGlyph } from "@/components/sports/SportGlyph"
import { SportChip } from "@/components/sports/SportChip"

interface TeamCardProps {
  team: {
    id: string
    name: string
    slug: string
    sport: { name: string; slug?: string; category?: string; icon?: string }
    city?: string | null
    country?: string | null
    logoUrl?: string | null
    coverPhotoUrl?: string | null
    memberCount: number
    globalRank?: number | null
    isVerified?: boolean
  }
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/teams/${team.slug}`} className="block" data-testid={`team-card-${team.id}`}>
      <div className="card-elevated overflow-hidden group hover:shadow-md transition-all duration-200">
        {/* Cover Image - controlled height */}
        <div className="relative h-20 sm:h-24">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/90 via-orange-500/70 to-amber-400/60" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:14px_14px]" />

          {team.coverPhotoUrl && (
            <img
              src={team.coverPhotoUrl}
              alt={team.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Rank Badge */}
          {team.globalRank && team.globalRank <= 10 && (
            <div className="absolute top-2 right-2 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow-sm">
              <Trophy className="w-3 h-3" />
              #{team.globalRank}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Sport chip anchored to top - overlaps header slightly */}
          <div className="-mt-8 sm:-mt-10 mb-3">
            {team.logoUrl ? (
              <div className="w-12 h-12 rounded-xl bg-background shadow-md overflow-hidden border-2 border-background">
                <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <SportChip
                sport={team.sport}
                label={team.sport?.name || "Sports"}
                className="shadow-sm"
                size="md"
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3
                className="font-semibold text-foreground leading-tight truncate group-hover:text-primary transition-colors"
                title={team.name}
              >
                {team.name}
              </h3>
              {team.isVerified && (
                <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
              )}
            </div>

            {(team.city || team.country) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{team.city || team.country}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{team.memberCount}</span>
              </div>
              {team.globalRank && team.globalRank > 10 && (
                <div className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-medium text-foreground">#{team.globalRank}</span>
                </div>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  )
}
