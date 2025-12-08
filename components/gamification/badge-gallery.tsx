import { Trophy, Flame, Star, Users, Medal, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Badge {
    id: string
    name: string
    description: string
    iconUrl: string
    color: string
    category: string
    rarity: string
    isEarned: boolean
}

interface BadgeGalleryProps {
    badges: Badge[]
}

const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
    COMMON: { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-600" },
    UNCOMMON: { bg: "bg-green-100", border: "border-green-400", text: "text-green-600" },
    RARE: { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-600" },
    EPIC: { bg: "bg-purple-100", border: "border-purple-400", text: "text-purple-600" },
    LEGENDARY: { bg: "bg-amber-100", border: "border-amber-400", text: "text-amber-600" },
}

export function BadgeGallery({ badges }: BadgeGalleryProps) {
    const categories = [
        { key: 'DISTANCE', label: 'Distance', icon: <Trophy className="w-4 h-4" /> },
        { key: 'CONSISTENCY', label: 'Consistency', icon: <Flame className="w-4 h-4" /> },
        { key: 'PERFORMANCE', label: 'Performance', icon: <Star className="w-4 h-4" /> },
        { key: 'SOCIAL', label: 'Social', icon: <Users className="w-4 h-4" /> },
        { key: 'CHALLENGE', label: 'Challenges', icon: <Medal className="w-4 h-4" /> },
    ]

    const earnedCount = badges.filter(b => b.isEarned).length

    return (
        <div className="space-y-6">
            {/* Summary Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Badge Collection</h2>
                    <p className="text-sm text-muted-foreground">
                        {earnedCount} of {badges.length} badges earned
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    {['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'].map((rarity) => (
                        <div
                            key={rarity}
                            className={cn(
                                "w-3 h-3 rounded-full",
                                rarityColors[rarity]?.bg || "bg-gray-100"
                            )}
                            title={rarity}
                        />
                    ))}
                </div>
            </div>

            {categories.map((category) => {
                const categoryBadges = badges.filter(b => b.category === category.key)
                if (categoryBadges.length === 0) return null

                const earnedInCategory = categoryBadges.filter(b => b.isEarned).length

                return (
                    <div key={category.key}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <span className="text-primary">{category.icon}</span>
                                {category.label}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                {earnedInCategory}/{categoryBadges.length}
                            </span>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {categoryBadges.map((badge) => {
                                const rarityStyle = rarityColors[badge.rarity] || rarityColors.COMMON

                                return (
                                    <div
                                        key={badge.id}
                                        className={cn(
                                            "relative group cursor-pointer transition-all duration-200",
                                            badge.isEarned ? "hover:-translate-y-1" : "opacity-50"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "w-full aspect-square rounded-xl flex items-center justify-center border-2 overflow-hidden relative transition-all",
                                                badge.isEarned
                                                    ? `${rarityStyle.bg} ${rarityStyle.border}`
                                                    : "bg-muted border-border grayscale"
                                            )}
                                        >
                                            <img
                                                src={badge.iconUrl}
                                                alt={badge.name}
                                                className="w-10 h-10 object-contain"
                                            />
                                            {!badge.isEarned && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Rarity Indicator */}
                                        {badge.rarity !== 'COMMON' && badge.isEarned && (
                                            <div className={cn(
                                                "absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-background shadow-sm",
                                                badge.rarity === 'LEGENDARY' ? 'bg-amber-400' :
                                                    badge.rarity === 'EPIC' ? 'bg-purple-500' :
                                                        badge.rarity === 'RARE' ? 'bg-blue-500' :
                                                            'bg-green-500'
                                            )} />
                                        )}

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-44 pointer-events-none">
                                            <div className="bg-popover text-popover-foreground text-xs rounded-xl p-3 shadow-xl border border-border">
                                                <div className="font-bold mb-1">{badge.name}</div>
                                                <div className="text-muted-foreground leading-tight text-[11px]">{badge.description}</div>
                                                <div className={cn(
                                                    "mt-2 pt-2 border-t border-border text-[10px] font-medium uppercase tracking-wider",
                                                    badge.isEarned ? rarityStyle.text : "text-muted-foreground"
                                                )}>
                                                    {badge.isEarned ? badge.rarity : "Locked"}
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 bg-popover border-l border-b border-border rotate-[-45deg] absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
