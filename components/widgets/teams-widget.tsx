import { Users, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TeamsWidget() {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-brand-blue" />
                    <h3 className="font-semibold text-gray-800 text-sm">My Teams</h3>
                </div>
            </div>

            <div className="divide-y divide-gray-50">
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <Avatar className="h-8 w-8 rounded bg-blue-100">
                        <AvatarFallback className="text-blue-600 font-bold text-xs">PR</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Prague Runners</div>
                        <div className="text-xs text-gray-500">24 Members</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>

                <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <Avatar className="h-8 w-8 rounded bg-green-100">
                        <AvatarFallback className="text-green-600 font-bold text-xs">FC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">FC Turbo</div>
                        <div className="text-xs text-gray-500">18 Members</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
            </div>
        </div>
    )
}
