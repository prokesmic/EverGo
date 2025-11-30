import Link from "next/link"
import { Trophy } from "lucide-react"

interface Challenge {
    id: string
    title: string
    endDate: string
    targetValue: number
    targetUnit: string
    sport: { icon: string } | null
    sponsorLogoUrl: string | null
    participation: {
        currentValue: number
    } | null
}

interface ChallengesWidgetProps {
    challenges: Challenge[]
}

export function ChallengesWidget({ challenges }: ChallengesWidgetProps) {
    const daysRemaining = (date: string) => {
        const diff = new Date(date).getTime() - new Date().getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
                <h3 className="font-semibold text-text-primary">Active Challenges</h3>
                <Link href="/challenges" className="text-sm text-brand-primary hover:underline">
                    View all
                </Link>
            </div>

            <div className="divide-y divide-border-light">
                {challenges.map((challenge) => (
                    <div key={challenge.id} className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                            {challenge.sponsorLogoUrl ? (
                                <img src={challenge.sponsorLogoUrl} alt="Sponsor" className="h-6" />
                            ) : (
                                <span className="text-xl">{challenge.sport?.icon || '🏆'}</span>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-text-primary truncate" title={challenge.title}>
                                    {challenge.title}
                                </div>
                                <div className="text-xs text-text-muted">
                                    {daysRemaining(challenge.endDate)} days left
                                </div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        {challenge.participation ? (
                            <div className="relative">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-brand-primary rounded-full transition-all"
                                        style={{ width: `${Math.min(100, (challenge.participation.currentValue / challenge.targetValue) * 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 text-xs text-text-muted">
                                    <span>{challenge.participation.currentValue.toFixed(1)} {challenge.targetUnit}</span>
                                    <span>{challenge.targetValue} {challenge.targetUnit}</span>
                                </div>
                            </div>
                        ) : (
                            <Link href={`/challenges`} className="block w-full py-1.5 text-center text-xs font-medium text-brand-primary bg-brand-blue/10 rounded-md hover:bg-brand-blue/20 transition-colors">
                                Join Challenge
                            </Link>
                        )}
                    </div>
                ))}

                {challenges.length === 0 && (
                    <div className="p-6 text-center text-sm text-text-muted">
                        No active challenges.
                        <br />
                        <Link href="/challenges" className="text-brand-primary hover:underline">
                            Browse upcoming
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
