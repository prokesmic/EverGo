import { Activity, Clock, Flame, ChevronRight } from "lucide-react"
import { CardShell } from "@/components/ui/CardShell"

interface ActivityBreakdown {
    sport: string
    distance: number
    percentage: number
    color: string
}

interface ActivitiesSummaryWidgetProps {
    totalDistance: number
    totalTime: number
    totalCalories: number
    breakdown: ActivityBreakdown[]
}

export function ActivitiesSummaryWidget({
    totalDistance,
    totalTime,
    totalCalories,
    breakdown
}: ActivitiesSummaryWidgetProps) {
    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        return `${h}:${m.toString().padStart(2, '0')}`
    }

    return (
        <CardShell
            title="Weekly Summary"
            action={<span className="flex items-center">View all <ChevronRight className="h-3 w-3 ml-1" /></span>}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Distance</div>
                    <div className="text-2xl font-bold text-gray-900">{totalDistance.toFixed(1)} <span className="text-sm font-normal text-gray-500">km</span></div>
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Time</div>
                    <div className="text-2xl font-bold text-gray-900">{formatTime(totalTime)} <span className="text-sm font-normal text-gray-500">h</span></div>
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Calories</div>
                    <div className="text-2xl font-bold text-gray-900">{(totalCalories / 1000).toFixed(1)}k <span className="text-sm font-normal text-gray-500">kcal</span></div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Activity Breakdown</span>
                    <span>Last 7 Days</span>
                </div>

                {/* Mini Bar Chart / Progress Bars */}
                <div className="space-y-2">
                    {breakdown.map((item) => (
                        <div key={item.sport} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.color.replace('text-', 'bg-').replace('bg-', 'bg-opacity-10 text-')}`}>
                                <Activity className="h-3 w-3" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium capitalize">{item.sport}</span>
                                    <span className="text-gray-500">{item.distance.toFixed(1)} km</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.color.split(' ')[0]}`}
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {breakdown.length === 0 && (
                        <div className="text-xs text-gray-400 text-center py-2">No activities this week</div>
                    )}
                </div>
            </div>
        </CardShell>
    )
}
