import { Activity, Clock, Flame, ChevronRight } from "lucide-react"
import { CardShell } from "@/components/ui/CardShell"

export function ActivitiesSummaryWidget() {
    return (
        <CardShell
            title="Weekly Summary"
            action={<span className="flex items-center">View all <ChevronRight className="h-3 w-3 ml-1" /></span>}
        >
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Distance</div>
                    <div className="text-2xl font-bold text-gray-900">42 <span className="text-sm font-normal text-gray-500">km</span></div>
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Time</div>
                    <div className="text-2xl font-bold text-gray-900">3:45 <span className="text-sm font-normal text-gray-500">h</span></div>
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Calories</div>
                    <div className="text-2xl font-bold text-gray-900">2.4k <span className="text-sm font-normal text-gray-500">kcal</span></div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Activity Breakdown</span>
                    <span>Last 7 Days</span>
                </div>

                {/* Mini Bar Chart / Progress Bars */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                            <Activity className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium">Running</span>
                                <span className="text-gray-500">32 km</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-green w-[75%] rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                            <Activity className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium">Cycling</span>
                                <span className="text-gray-500">10 km</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 w-[25%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CardShell>
    )
}
