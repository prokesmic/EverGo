import { Activity, Clock, Flame } from "lucide-react"

export function ActivitiesSummaryWidget() {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-sm">Weekly Summary</h3>
                <span className="text-xs text-gray-500">Sep 24 - 30</span>
            </div>

            <div className="p-4 grid grid-cols-3 gap-2">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                        <Activity className="h-3 w-3" />
                        <span>Dist</span>
                    </div>
                    <div className="font-bold text-gray-900">42 km</div>
                </div>

                <div className="text-center border-l border-gray-100">
                    <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                        <Clock className="h-3 w-3" />
                        <span>Time</span>
                    </div>
                    <div className="font-bold text-gray-900">3h 45m</div>
                </div>

                <div className="text-center border-l border-gray-100">
                    <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                        <Flame className="h-3 w-3" />
                        <span>Cals</span>
                    </div>
                    <div className="font-bold text-gray-900">2,450</div>
                </div>
            </div>
        </div>
    )
}
