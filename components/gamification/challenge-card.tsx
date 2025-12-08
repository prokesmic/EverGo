import Link from "next/link"
import { format } from "date-fns"
import { Trophy, CheckCircle2, Clock, Users, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
        <div className="card-elevated overflow-hidden flex flex-col h-full group">
            {/* Header Image */}
            <div className="h-28 bg-gradient-to-br from-primary to-primary-dark relative">
                {challenge.imageUrl && (
                    <img src={challenge.imageUrl} alt={challenge.title} className="w-full h-full object-cover" />
                )}
                {challenge.sponsorLogoUrl && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
                        <img src={challenge.sponsorLogoUrl} alt="Sponsor" className="h-4" />
                    </div>
                )}
                {isCompleted && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 shadow-sm uppercase tracking-wide">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                    </div>
                )}
                {!isCompleted && participation && (
                    <div className="absolute top-2 left-2 bg-primary text-white rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 shadow-sm uppercase tracking-wide">
                        In Progress
                    </div>
                )}
                <div className="absolute bottom-2 right-2 text-3xl drop-shadow-md">
                    {challenge.sport?.icon || '🏆'}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground leading-tight mb-1 truncate group-hover:text-primary transition-colors">
                            {challenge.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                                {format(new Date(challenge.startDate), "MMM d")} - {format(new Date(challenge.endDate), "MMM d")}
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">{challenge.description}</p>

                {/* Target */}
                <div className="bg-muted/50 rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Goal</div>
                            <div className="text-lg font-bold text-foreground">
                                {challenge.targetValue} <span className="text-sm font-normal text-muted-foreground">{challenge.targetUnit}</span>
                            </div>
                        </div>
                        {challenge._count?.participants > 0 && (
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    {challenge._count.participants} joined
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress (if participating) */}
                {participation && (
                    <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground">Your progress</span>
                            <span className={cn(
                                "font-medium",
                                isCompleted ? "text-green-600" : "text-foreground"
                            )}>
                                {progress.toFixed(1)} / {challenge.targetValue} {challenge.targetUnit}
                            </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    isCompleted ? "bg-green-500" : "bg-primary"
                                )}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Reward */}
                {challenge.badge && (
                    <div className="flex items-center gap-2.5 p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl mb-3 border border-amber-200/50 dark:border-amber-800/50">
                        <img src={challenge.badge.iconUrl} alt="Badge" className="w-8 h-8 shrink-0" />
                        <div className="text-xs min-w-0">
                            <span className="text-muted-foreground block">Reward</span>
                            <span className="font-medium text-foreground truncate block">{challenge.badge.name}</span>
                        </div>
                    </div>
                )}

                {/* Action */}
                {!participation ? (
                    <Button
                        onClick={onJoin}
                        disabled={isJoining}
                        className="w-full gap-1.5"
                    >
                        {isJoining ? "Joining..." : "Join Challenge"}
                        {!isJoining && <ChevronRight className="h-4 w-4" />}
                    </Button>
                ) : (
                    <Link href={`/challenges/${challenge.id}`}>
                        <Button variant="outline" className="w-full gap-1.5">
                            {isCompleted ? "View Results" : "View Progress"}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    )
}
