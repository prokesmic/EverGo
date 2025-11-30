import { Trophy, Flame, Star, Users, Medal } from "lucide-react"

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

export function BadgeGallery({ badges }: BadgeGalleryProps) {
    const categories = [
        { key: 'DISTANCE', label: 'Distance', icon: <Trophy className="w-4 h-4" /> },
        { key: 'CONSISTENCY', label: 'Consistency', icon: <Flame className="w-4 h-4" /> },
        { key: 'PERFORMANCE', label: 'Performance', icon: <Star className="w-4 h-4" /> },
        { key: 'SOCIAL', label: 'Social', icon: <Users className="w-4 h-4" /> },
        { key: 'CHALLENGE', label: 'Challenges', icon: <Medal className="w-4 h-4" /> },
    ]

    return (
        <div className="space-y-8">
            {categories.map((category) => {
                const categoryBadges = badges.filter(b => b.category === category.key)
                if (categoryBadges.length === 0) return null

                return (
                    <div key={category.key}>
                        <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-brand-primary">{category.icon}</span>
                            {category.label}
                        </h3>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {categoryBadges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className={`relative group cursor-pointer transition-all hover:-translate-y-1 ${!badge.isEarned ? 'opacity-40 grayscale' : ''
                                        }`}
                                >
                                    <div
                                        className="w-full aspect-square rounded-xl flex items-center justify-center shadow-sm border border-border-light overflow-hidden relative"
                                        style={{ backgroundColor: badge.isEarned ? `${badge.color}15` : '#f3f4f6' }}
                                    >
                                        <img
                                            src={badge.iconUrl}
                                            alt={badge.name}
                                            className="w-12 h-12 object-contain"
                                        />

                                        {/* Rarity Border/Glow could go here */}
                                    </div>

                                    {/* Rarity Indicator */}
                                    {badge.rarity !== 'COMMON' && (
                                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${badge.rarity === 'LEGENDARY' ? 'bg-yellow-400' :
                                            badge.rarity === 'EPIC' ? 'bg-purple-500' :
                                                badge.rarity === 'RARE' ? 'bg-blue-500' :
                                                    'bg-green-500'
                                            }`} />
                                    )}

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-48 pointer-events-none">
                                        <div className="bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl text-center">
                                            <div className="font-bold mb-1">{badge.name}</div>
                                            <div className="text-gray-300 leading-tight">{badge.description}</div>
                                            {!badge.isEarned && (
                                                <div className="mt-1 pt-1 border-t border-gray-700 text-gray-400 italic">
                                                    Locked
                                                </div>
                                            )}
                                        </div>
                                        {/* Arrow */}
                                        <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
