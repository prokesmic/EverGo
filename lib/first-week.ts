import { prisma } from './db'
import { differenceInDays, startOfWeek, addDays } from 'date-fns'

export interface FirstWeekProgress {
  isFirstWeek: boolean
  daysRemaining: number
  activitiesLogged: number
  effortScore: number
  milestones: {
    firstActivity: boolean
    threeActivities: boolean
    fiveActivities: boolean
    weeklyGoal: boolean // 100 effort points
  }
  nextMilestone: {
    name: string
    description: string
    progress: number
    target: number
  } | null
}

const FIRST_WEEK_DURATION_DAYS = 7
const WEEKLY_GOAL_EFFORT = 100

export async function getFirstWeekProgress(userId: string): Promise<FirstWeekProgress> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      onboardingCompleted: true,
    },
  })

  if (!user) {
    return {
      isFirstWeek: false,
      daysRemaining: 0,
      activitiesLogged: 0,
      effortScore: 0,
      milestones: {
        firstActivity: false,
        threeActivities: false,
        fiveActivities: false,
        weeklyGoal: false,
      },
      nextMilestone: null,
    }
  }

  const daysSinceCreation = differenceInDays(new Date(), user.createdAt)
  const isFirstWeek = daysSinceCreation < FIRST_WEEK_DURATION_DAYS

  // Get activities logged since account creation
  const activities = await prisma.activity.findMany({
    where: {
      userId,
      createdAt: { gte: user.createdAt },
    },
    select: {
      id: true,
      effortScore: true,
    },
  })

  const activitiesLogged = activities.length
  const effortScore = activities.reduce((sum, a) => sum + (a.effortScore ?? 0), 0)

  const milestones = {
    firstActivity: activitiesLogged >= 1,
    threeActivities: activitiesLogged >= 3,
    fiveActivities: activitiesLogged >= 5,
    weeklyGoal: effortScore >= WEEKLY_GOAL_EFFORT,
  }

  // Determine next milestone
  let nextMilestone: FirstWeekProgress['nextMilestone'] = null

  if (!milestones.firstActivity) {
    nextMilestone = {
      name: 'First Activity',
      description: 'Log your first activity to get started!',
      progress: 0,
      target: 1,
    }
  } else if (!milestones.threeActivities) {
    nextMilestone = {
      name: 'Getting Started',
      description: 'Log 3 activities to build momentum',
      progress: activitiesLogged,
      target: 3,
    }
  } else if (!milestones.weeklyGoal) {
    nextMilestone = {
      name: 'Weekly Goal',
      description: 'Reach 100 effort points this week',
      progress: Math.round(effortScore),
      target: WEEKLY_GOAL_EFFORT,
    }
  } else if (!milestones.fiveActivities) {
    nextMilestone = {
      name: 'Consistency',
      description: 'Log 5 activities to show dedication',
      progress: activitiesLogged,
      target: 5,
    }
  }

  return {
    isFirstWeek,
    daysRemaining: Math.max(0, FIRST_WEEK_DURATION_DAYS - daysSinceCreation),
    activitiesLogged,
    effortScore: Math.round(effortScore),
    milestones,
    nextMilestone,
  }
}

export async function isUserInFirstWeek(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  })

  if (!user) return false

  const daysSinceCreation = differenceInDays(new Date(), user.createdAt)
  return daysSinceCreation < FIRST_WEEK_DURATION_DAYS
}

export interface FirstWeekTip {
  id: string
  title: string
  description: string
  actionLabel: string
  actionUrl: string
  icon: 'activity' | 'rank' | 'battle' | 'sync' | 'effort'
}

export function getFirstWeekTips(progress: FirstWeekProgress): FirstWeekTip[] {
  const tips: FirstWeekTip[] = []

  if (!progress.milestones.firstActivity) {
    tips.push({
      id: 'log-first',
      title: 'Log Your First Activity',
      description: 'Every journey begins with a single step. Log an activity to start earning effort points.',
      actionLabel: 'Log Activity',
      actionUrl: '/activity/log',
      icon: 'activity',
    })
  }

  if (progress.milestones.firstActivity && progress.effortScore < 50) {
    tips.push({
      id: 'build-effort',
      title: 'Build Your Effort Score',
      description: 'Rate your activities by intensity to earn more effort points and climb the rankings.',
      actionLabel: 'View Effort Score',
      actionUrl: '/rankings',
      icon: 'effort',
    })
  }

  if (progress.activitiesLogged >= 2) {
    tips.push({
      id: 'check-rank',
      title: 'Check Your Ranking',
      description: "See where you stand globally and in your city. You're already on the leaderboard!",
      actionLabel: 'View Rankings',
      actionUrl: '/rankings',
      icon: 'rank',
    })
  }

  if (progress.activitiesLogged >= 3) {
    tips.push({
      id: 'rank-battle',
      title: 'Ready for Battle?',
      description: "Weekly rank battles match you with similar athletes. Keep logging to get matched!",
      actionLabel: 'View Battles',
      actionUrl: '/rank-battles',
      icon: 'battle',
    })
  }

  return tips.slice(0, 2) // Return max 2 tips at a time
}
