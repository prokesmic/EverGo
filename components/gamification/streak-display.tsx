import { Flame } from "lucide-react"

interface StreakDisplayProps {
    streak: {
        currentStreak: number
        longestStreak: number
        weeklyProgress: number
        weeklyGoal: number
        streakAtRisk: boolean
    }
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
    const isAtRisk = streak.streakAtRisk

    return (
        <div className="bg-white rounded-xl shadow-sm border border-border-light p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">Your Streak</h3>
                <Flame className={`w-6 h-6 ${isAtRisk ? 'text-orange-500 animate-pulse' : 'text-brand-primary'}`} />
            </div>

            {/* Current Streak */}
            <div className="text-center mb-6">
                <div className={`text-5xl font-bold ${isAtRisk ? 'text-orange-500' : 'text-text-primary'}`}>
                    {streak.currentStreak}
                </div>
                <div className="text-text-muted text-sm">day streak</div>
                {isAtRisk && (
                    <div className="mt-2 text-xs text-orange-600 font-medium bg-orange-50 py-1 px-2 rounded-full inline-block">
                        ⚠️ Log an activity today!
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-light">
                <div className="text-center">
                    <div className="text-xl font-bold text-text-primary">{streak.longestStreak}</div>
                    <div className="text-xs text-text-muted">Longest streak</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-text-primary">
                        {streak.weeklyProgress}/{streak.weeklyGoal}
                    </div>
                    <div className="text-xs text-text-muted">This week</div>
                </div>
            </div>

            {/* Weekly Progress */}
            <div className="mt-4 pt-4 border-t border-border-light">
                <div className="flex justify-between text-xs text-text-muted mb-1">
                    <span>Weekly goal</span>
                    <span>{Math.round((streak.weeklyProgress / streak.weeklyGoal) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.min(100, (streak.weeklyProgress / streak.weeklyGoal) * 100)}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
