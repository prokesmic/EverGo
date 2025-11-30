import { Users, ExternalLink, MessageSquare, ChevronRight } from "lucide-react"
import { CardShell } from "@/components/ui/CardShell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function TeamsWidget() {
    const teams = [
        { id: 1, name: "Prague Runners", sport: "Running", members: 24, nextTraining: "Tue 18:00", image: "", initials: "PR", color: "bg-blue-100 text-blue-600" },
        { id: 2, name: "FC Turbo", sport: "Football", members: 18, nextTraining: "Thu 19:30", image: "", initials: "FC", color: "bg-green-100 text-green-600" },
    ]

    return (
        <CardShell
            title="My Teams"
            icon={<Users className="h-5 w-5" />}
            action={<Link href="/teams" className="flex items-center">View all <ChevronRight className="h-3 w-3 ml-1" /></Link>}
        >
            <div className="space-y-4">
                {teams.map((team) => (
                    <div key={team.id} className="flex items-start gap-3 group">
                        <Avatar className={`h-10 w-10 rounded-lg border border-gray-100 ${team.color}`}>
                            <AvatarImage src={team.image} />
                            <AvatarFallback className={team.color}>{team.initials}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-sm font-semibold text-gray-900 truncate">{team.name}</div>
                                    <div className="text-xs text-gray-500">{team.sport} • {team.members} members</div>
                                </div>
                            </div>

                            <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded w-fit">
                                <span className="font-medium text-gray-700">Next:</span> {team.nextTraining}
                            </div>

                            <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 h-7" asChild>
                                    <Link href={`/teams/${team.id}`}>
                                        <ExternalLink className="h-3 w-3 mr-1" /> Page
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 h-7" asChild>
                                    <Link href={`/teams/${team.id}/chat`}>
                                        <MessageSquare className="h-3 w-3 mr-1" /> Chat
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </CardShell>
    )
}
