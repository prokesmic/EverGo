import { MoreVertical, Watch, Bike, Footprints, Activity, Trophy } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Gear {
    id: string
    gearType: string
    brand: string
    model: string
    nickname?: string | null
    purchaseDate?: Date | string | null
    totalDistance: number
    activityCount: number
    maxRecommendedDistance?: number | null
    isRetired: boolean
}

interface GearCardProps {
    gear: Gear
}

const GearIcon = ({ type, className }: { type: string, className?: string }) => {
    switch (type) {
        case 'RUNNING_SHOES':
        case 'CYCLING_SHOES':
            return <Footprints className={className} />
        case 'BIKE':
            return <Bike className={className} />
        case 'WATCH':
        case 'HEART_RATE_MONITOR':
            return <Watch className={className} />
        case 'GOLF_CLUBS':
        case 'TENNIS_RACKET':
            return <Trophy className={className} />
        default:
            return <Activity className={className} />
    }
}

export function GearCard({ gear }: GearCardProps) {
    const usagePercent = gear.maxRecommendedDistance
        ? Math.min(100, (gear.totalDistance / gear.maxRecommendedDistance) * 100)
        : null

    const needsReplacement = usagePercent && usagePercent >= 80

    return (
        <div className={`bg-white rounded-lg shadow-sm p-4 ${needsReplacement ? 'border-l-4 border-orange-500' : ''}`}>
            <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                    <GearIcon type={gear.gearType} className="w-8 h-8 text-gray-600" />
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-800">
                                {gear.nickname || `${gear.brand} ${gear.model}`}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {gear.brand} {gear.model}
                            </p>
                        </div>

                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Usage Stats */}
                    <div className="mt-3 flex items-center gap-6 text-sm">
                        <div>
                            <span className="text-gray-500">Distance:</span>
                            <span className="ml-1 font-medium text-gray-800">
                                {(gear.totalDistance / 1000).toFixed(0)} km
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Activities:</span>
                            <span className="ml-1 font-medium text-gray-800">{gear.activityCount}</span>
                        </div>
                        {gear.purchaseDate && (
                            <div>
                                <span className="text-gray-500">Age:</span>
                                <span className="ml-1 font-medium text-gray-800">
                                    {formatDistanceToNow(new Date(gear.purchaseDate), { addSuffix: true })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Usage Bar (for items with recommended max) */}
                    {usagePercent !== null && gear.maxRecommendedDistance && (
                        <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Usage</span>
                                <span className={needsReplacement ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                                    {(gear.totalDistance / 1000).toFixed(0)} / {(gear.maxRecommendedDistance / 1000).toFixed(0)} km
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${usagePercent >= 100 ? 'bg-red-500' :
                                        usagePercent >= 80 ? 'bg-orange-500' :
                                            'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min(100, usagePercent)}%` }}
                                />
                            </div>
                            {needsReplacement && (
                                <p className="text-xs text-orange-600 mt-1">
                                    ⚠️ Consider replacing soon
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
