import { User, UserStats, UserSportStats, Activity } from "@prisma/client"
import { prisma } from "@/lib/db"

export async function calculateSportIndex(
    user: User,
    stats: UserStats,
    sportStats: UserSportStats[]
): Promise<number> {
    let score = 0;

    // 1. Activity Frequency (max 200 points)
    // Based on activities per week over last 4 weeks
    const recentActivities = await getActivitiesInLastDays(user.id, 28);
    const activitiesPerWeek = recentActivities.length / 4;
    const frequencyScore = Math.min(200, activitiesPerWeek * 25); // 8+ activities/week = max
    score += frequencyScore;

    // 2. Performance Level (max 400 points)
    // Based on best performances in each sport compared to percentile
    let performanceScore = 0;
    if (sportStats.length > 0) {
        for (const sportStat of sportStats) {
            const percentile = await getPercentileRank(sportStat.sportId, sportStat.performanceScore);
            performanceScore += (percentile / 100) * (400 / sportStats.length);
        }
    }
    score += performanceScore;

    // 3. Consistency/Streaks (max 150 points)
    // We don't have currentStreak on User yet, so let's calculate it or use a placeholder
    const currentStreak = await calculateCurrentStreak(user.id);
    const streakScore = Math.min(150, currentStreak * 5); // 30+ day streak = max
    score += streakScore;

    // 4. Variety Bonus (max 100 points)
    // Bonus for doing multiple sports
    const sportsCount = sportStats.length;
    const varietyScore = Math.min(100, sportsCount * 25); // 4+ sports = max
    score += varietyScore;

    // 5. Improvement Trend (max 100 points)
    // Compare this month vs last month
    const improvement = await calculateImprovementRate(user.id);
    const improvementScore = Math.min(100, Math.max(0, improvement * 10));
    score += improvementScore;

    // 6. Social Engagement (max 50 points)
    // Teams, challenges completed, etc.
    const socialScore = await calculateSocialScore(user.id);
    score += Math.min(50, socialScore);

    return Math.round(Math.min(1000, score));
}

async function getActivitiesInLastDays(userId: string, days: number): Promise<Activity[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return prisma.activity.findMany({
        where: {
            userId,
            activityDate: {
                gte: date
            }
        }
    });
}

async function getPercentileRank(sportId: string, score: number): Promise<number> {
    // Count how many users have a lower score
    const countLower = await prisma.userSportStats.count({
        where: {
            sportId,
            performanceScore: {
                lt: score
            }
        }
    });

    const total = await prisma.userSportStats.count({
        where: { sportId }
    });

    if (total === 0) return 50; // Default to average if no data

    return (countLower / total) * 100;
}

async function calculateCurrentStreak(userId: string): Promise<number> {
    // Simplified streak calculation
    // In a real app, this would be more complex or stored in the DB
    const activities = await prisma.activity.findMany({
        where: { userId },
        orderBy: { activityDate: 'desc' },
        take: 30,
        select: { activityDate: true }
    });

    if (activities.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's an activity today or yesterday to keep streak alive
    const lastActivityDate = new Date(activities[0].activityDate);
    lastActivityDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - lastActivityDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return 0; // Streak broken

    // Calculate consecutive days
    // This is a naive implementation, assuming one activity per day for simplicity
    // A proper implementation would group by date
    let currentDate = lastActivityDate;

    for (const activity of activities) {
        const actDate = new Date(activity.activityDate);
        actDate.setHours(0, 0, 0, 0);

        const diff = Math.abs(currentDate.getTime() - actDate.getTime());
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days <= 1) {
            if (days === 1) streak++;
            currentDate = actDate;
        } else {
            break;
        }
    }

    return streak + 1; // +1 for the first day found
}

async function calculateImprovementRate(userId: string): Promise<number> {
    // Placeholder: Compare total distance this month vs last month
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthActivities = await prisma.activity.findMany({
        where: { userId, activityDate: { gte: startOfThisMonth } },
        select: { distanceMeters: true }
    });

    const lastMonthActivities = await prisma.activity.findMany({
        where: { userId, activityDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
        select: { distanceMeters: true }
    });

    const thisMonthDist = thisMonthActivities.reduce((acc, act) => acc + (act.distanceMeters || 0), 0);
    const lastMonthDist = lastMonthActivities.reduce((acc, act) => acc + (act.distanceMeters || 0), 0);

    if (lastMonthDist === 0) return thisMonthDist > 0 ? 10 : 0; // Arbitrary improvement if starting from 0

    return ((thisMonthDist - lastMonthDist) / lastMonthDist) * 10; // Scale up
}

async function calculateSocialScore(userId: string): Promise<number> {
    // Count team memberships and friends
    const teamCount = await prisma.teamMember.count({ where: { userId } });
    // Assuming friend system is implemented or using placeholder
    // const friendCount = await prisma.friendship.count({ where: { OR: [{ userId1: userId }, { userId2: userId }] } });

    return teamCount * 10; // + friendCount * 5
}

// Background Job Logic

export async function recalculateAllRankings() {
    // 1. Recalculate all user sport indexes
    const users = await prisma.user.findMany({
        include: { stats: true, sportStats: true }
    });

    for (const user of users) {
        // Ensure stats exist
        let stats = user.stats;
        if (!stats) {
            stats = await prisma.userStats.create({
                data: { userId: user.id }
            });
        }

        const newIndex = await calculateSportIndex(user, stats, user.sportStats);
        await prisma.userStats.update({
            where: { userId: user.id },
            data: {
                sportIndex: newIndex,
                sportIndexBest: Math.max(newIndex, stats.sportIndexBest)
            }
        });
    }

    // 2. Recalculate global rankings
    await recalculateRankingsForScope('GLOBAL', null);

    // 3. Recalculate country rankings
    const countries = await prisma.userStats.findMany({
        distinct: ['country'],
        select: { country: true }
    });
    for (const { country } of countries) {
        if (country) {
            await recalculateRankingsForScope('COUNTRY', country);
        }
    }

    // 4. Recalculate city rankings
    const cities = await prisma.userStats.findMany({
        distinct: ['city'],
        select: { city: true }
    });
    for (const { city } of cities) {
        if (city) {
            await recalculateRankingsForScope('CITY', city);
        }
    }

    // 5. Cache top 100 leaderboards (Simplified: just log for now)
    console.log("Rankings recalculated and cached.");
}

async function recalculateRankingsForScope(scope: string, scopeValue: string | null) {
    const whereClause: any = {};
    if (scope === 'COUNTRY' && scopeValue) whereClause.country = scopeValue;
    if (scope === 'CITY' && scopeValue) whereClause.city = scopeValue;

    const users = await prisma.userStats.findMany({
        where: whereClause,
        orderBy: { sportIndex: 'desc' },
        select: { userId: true, sportIndex: true }
    });

    for (let i = 0; i < users.length; i++) {
        const rankField = scope === 'GLOBAL' ? 'globalRank' :
            scope === 'COUNTRY' ? 'countryRank' :
                scope === 'CITY' ? 'cityRank' : null;

        if (rankField) {
            await prisma.userStats.update({
                where: { userId: users[i].userId },
                data: { [rankField]: i + 1 }
            });
        }
    }
}
