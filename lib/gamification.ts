import { prisma } from "@/lib/db"

/**
 * Updates user streak based on new activity.
 */
export async function updateStreakOnActivity(userId: string, activityDate: Date) {
    const today = new Date(activityDate)
    today.setHours(0, 0, 0, 0)

    let streak = await prisma.userStreak.findUnique({ where: { userId } })

    if (!streak) {
        streak = await prisma.userStreak.create({
            data: {
                userId,
                currentStreak: 1,
                longestStreak: 1,
                lastActivityDate: activityDate,
                weeklyProgress: 1,
                weekStartDate: getWeekStartDate(today)
            }
        })
        return
    }

    // Check if activity is on the same day as last activity
    if (streak.lastActivityDate) {
        const lastDate = new Date(streak.lastActivityDate)
        lastDate.setHours(0, 0, 0, 0)

        if (lastDate.getTime() === today.getTime()) {
            // Already logged today, just update weekly progress if needed
            // (Logic for weekly progress below)
        } else {
            // Check if consecutive day
            const diffTime = Math.abs(today.getTime() - lastDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays === 1) {
                // Consecutive day, increment streak
                const newStreak = streak.currentStreak + 1
                await prisma.userStreak.update({
                    where: { userId },
                    data: {
                        currentStreak: newStreak,
                        longestStreak: Math.max(streak.longestStreak, newStreak),
                        lastActivityDate: activityDate
                    }
                })
            } else {
                // Streak broken
                await prisma.userStreak.update({
                    where: { userId },
                    data: {
                        currentStreak: 1,
                        lastActivityDate: activityDate
                    }
                })
            }
        }
    } else {
        // First activity ever (should be covered by create, but just in case)
        await prisma.userStreak.update({
            where: { userId },
            data: {
                currentStreak: 1,
                longestStreak: 1,
                lastActivityDate: activityDate
            }
        })
    }

    // Update Weekly Progress
    const weekStart = getWeekStartDate(today)
    if (!streak.weekStartDate || streak.weekStartDate.getTime() !== weekStart.getTime()) {
        // New week
        await prisma.userStreak.update({
            where: { userId },
            data: {
                weekStartDate: weekStart,
                weeklyProgress: 1
            }
        })
    } else {
        // Same week, increment progress
        await prisma.userStreak.update({
            where: { userId },
            data: {
                weeklyProgress: { increment: 1 }
            }
        })
    }
}

function getWeekStartDate(date: Date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
}

/**
 * Updates progress for all active challenges the user is participating in.
 */
export async function updateChallengeProgress(userId: string, activity: any) {
    const now = new Date()

    // Find active challenges user has joined
    const participations = await prisma.challengeParticipant.findMany({
        where: {
            userId,
            isCompleted: false,
            challenge: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now }
            }
        },
        include: {
            challenge: true
        }
    })

    for (const p of participations) {
        const challenge = p.challenge

        // Check sport filter
        if (challenge.sportId && challenge.sportId !== activity.sportId) {
            continue
        }

        let increment = 0
        switch (challenge.targetType) {
            case "DISTANCE":
                increment = activity.distanceMeters || 0
                break
            case "DURATION":
                increment = activity.durationSeconds || 0
                break
            case "ACTIVITIES":
                increment = 1
                break
            case "CALORIES":
                increment = activity.caloriesBurned || 0
                break
            case "ELEVATION":
                increment = activity.elevationGain || 0
                break
        }

        if (increment > 0) {
            const newValue = p.currentValue + increment
            const isCompleted = newValue >= challenge.targetValue

            await prisma.challengeParticipant.update({
                where: { id: p.id },
                data: {
                    currentValue: newValue,
                    isCompleted,
                    completedAt: isCompleted ? now : null
                }
            })

            if (isCompleted && challenge.badgeId) {
                // Award badge
                await awardBadge(userId, challenge.badgeId)
            }
        }
    }
}

/**
 * Awards a badge to a user if they don't have it yet.
 */
export async function awardBadge(userId: string, badgeId: string) {
    try {
        await prisma.userBadge.create({
            data: {
                userId,
                badgeId
            }
        })
        console.log(`Awarded badge ${badgeId} to user ${userId}`)

        // Notify user
        const { notifyBadgeEarned } = await import("@/lib/notifications")
        await notifyBadgeEarned(userId, badgeId)
    } catch (error) {
        // Ignore unique constraint violation (already has badge)
    }
}

/**
 * Checks generic badge criteria (e.g., total distance) and awards badges.
 * Should be called after activity creation.
 */
export async function checkBadgeCriteria(userId: string) {
    const userStats = await prisma.userStats.findUnique({ where: { userId } })
    if (!userStats) return

    const badges = await prisma.badge.findMany({
        where: { isActive: true, sportId: null } // Global badges only for now
    })

    for (const badge of badges) {
        let qualified = false
        switch (badge.criteriaType) {
            case "TOTAL_DISTANCE":
                qualified = userStats.totalDistance >= badge.criteriaValue
                break
            case "TOTAL_ACTIVITIES":
                qualified = userStats.totalActivities >= badge.criteriaValue
                break
            case "SPORT_INDEX":
                qualified = userStats.sportIndex >= badge.criteriaValue
                break
        }

        if (qualified) {
            await awardBadge(userId, badge.id)
        }
    }
}
