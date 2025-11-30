import Link from "next/link"
import { format } from "date-fns"
import { Trophy, CheckCircle2 } from "lucide-react"

interface ChallengeCardProps {
    challenge: any
    onJoin?: () => void
    isJoining?: boolean
}

export function ChallengeCard({ challenge, onJoin, isJoining }: ChallengeCardProps) {
    const participation = challenge.participation
    const progress = participation?.currentValue || 0
    const percentage = Math.min(100, (progress / challenge.targetValue) * 100)
    const isCompleted = participation?.isCompleted

    return (
        <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden flex flex-col h-full">
            {/* Header Image */}
            <div className="h-32 bg-gradient-to-r from-brand-blue to-blue-600 relative">
                {challenge.imageUrl && (
                    <img src={challenge.imageUrl} alt={challenge.title} className="w-full h-full object-cover" />
                )}
                {challenge.sponsorLogoUrl && (
                    <div className="absolute top-3 right-3 bg-white/90 rounded px-2 py-1 shadow-sm">
                        <img src={challenge.sponsorLogoUrl} alt="Sponsor" className="h-4" />
                    </div>
                )}
                {isCompleted && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="font-semibold text-text-primary text-lg leading-tight mb-1">{challenge.title}</h3>
                        <p className="text-xs text-text-secondary">
                            {format(new Date(challenge.startDate), "MMM d")} - {format(new Date(challenge.endDate), "MMM d")}
                        </p>
                    </div>
                    <span className="text-2xl">{challenge.sport?.icon || '🏆'}</span>
                </div>

                <p className="text-sm text-text-muted mb-4 line-clamp-2 flex-1">{challenge.description}</p>

                {/* Target */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-center">
                        <div className="text-xl font-bold text-text-primary">
                            {challenge.targetValue} {challenge.targetUnit}
                        </div>
                        <div className="text-xs text-text-muted uppercase tracking-wide">Goal</div>
                    </div>
                </div>

                {/* Progress (if participating) */}
                {participation ? (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-secondary">Your progress</span>
                            <span className="font-medium text-text-primary">
                                {progress.toFixed(1)} / {challenge.targetValue} {challenge.targetUnit}
                            </span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-brand-primary'
                                    }`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                ) : null}

                {/* Reward */}
                {challenge.badge && (
                    <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg mb-4 border border-amber-100">
                        <img src={challenge.badge.iconUrl} alt="Badge" className="w-8 h-8" />
                        <div className="text-xs">
                            <span className="text-text-secondary block">Reward</span>
                            <span className="font-medium text-text-primary">{challenge.badge.name}</span>
                        </div>
                    </div>
                )}

                {/* Action */}
                {!participation ? (
                    <button
                        onClick={onJoin}
                        disabled={isJoining}
                        className="w-full py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
                    >
                        {isJoining ? "Joining..." : "Join Challenge"}
                    </button>
                ) : (
                    <div className="w-full py-2 text-center border border-border-light text-text-secondary rounded-lg font-medium bg-gray-50 cursor-default">
                        Joined
                    </div>
                )}
            </div>
        </div>
    )
}
