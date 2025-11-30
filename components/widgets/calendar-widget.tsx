import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

export function CalendarWidget() {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-brand-blue" />
                    <h3 className="font-semibold text-gray-800 text-sm">Calendar</h3>
                </div>
                <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="h-3 w-3 text-gray-500" /></button>
                    <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="h-3 w-3 text-gray-500" /></button>
                </div>
            </div>

            <div className="p-4">
                <div className="space-y-3">
                    <div className="flex gap-3 items-start">
                        <div className="w-10 text-center bg-blue-50 rounded p-1">
                            <div className="text-xs text-blue-600 font-bold">SEP</div>
                            <div className="text-sm font-bold text-gray-800">28</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900">Prague Marathon</div>
                            <div className="text-xs text-gray-500">09:00 AM • Running</div>
                        </div>
                    </div>

                    <div className="flex gap-3 items-start">
                        <div className="w-10 text-center bg-green-50 rounded p-1">
                            <div className="text-xs text-green-600 font-bold">OCT</div>
                            <div className="text-sm font-bold text-gray-800">05</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900">Team Training</div>
                            <div className="text-xs text-gray-500">18:00 PM • Football</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
