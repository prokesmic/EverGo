import { Trophy, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export function RankingsWidget() {
    // Mock data for MVP
    const rankings = [
        { rank: 1, name: "Michal Prokes", value: "125 km", color: "bg-[#FFD700]" },
        { rank: 2, name: "Sarah Smith", value: "98 km", color: "bg-[#C0C0C0]" },
        { rank: 3, name: "John Doe", value: "85 km", color: "bg-[#CD7F32]" },
        { rank: 4, name: "Emma Wilson", value: "72 km", color: "bg-gray-200 text-gray-600" },
        { rank: 5, name: "Tom Brown", value: "65 km", color: "bg-gray-200 text-gray-600" },
    ]

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-[#0078D4] to-[#005A9E] px-4 py-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2 font-semibold">
                    <Trophy className="h-4 w-4 text-yellow-300" />
                    <span>Club Rankings</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white/90">Weekly</span>
            </div>

            <div className="divide-y divide-gray-50">
                {rankings.map((user) => (
                    <div key={user.rank} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${user.color} ${user.rank <= 3 ? 'text-white' : ''}`}>
                            {user.rank}
                        </div>

                        <Avatar className="h-8 w-8 border border-gray-100">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">Running • {user.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                <Link href="/rankings" className="text-xs font-medium text-brand-blue hover:underline flex items-center justify-center gap-1">
                    View all rankings
                    <ChevronRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    )
}
