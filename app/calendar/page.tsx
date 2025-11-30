import { CalendarWidget } from "@/components/widgets/calendar-widget"

export default function CalendarPage() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Calendar</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <CalendarWidget />
            </div>
        </div>
    )
}
