/**
 * Rankings Ladder Helpers
 *
 * V6 - Provides city/country ladder data for home page widgets
 */

import { prisma } from "@/lib/db"

export interface LadderEntry {
  rank: number
  userId: string
  displayName: string | null
  username: string | null
  avatarUrl: string | null
  power: number
  isCurrentUser: boolean
}

/**
 * Get city-based power ladder for the current week
 */
export async function getCityLadder(
  city: string,
  currentUserId: string,
  limit: number = 10
): Promise<LadderEntry[]> {
  // Get start of current week (Monday)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Monday = 0
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - diff)
  weekStart.setHours(0, 0, 0, 0)

  // Get users in the same city with their weekly power
  const usersWithPower = await prisma.user.findMany({
    where: {
      city: city,
      activities: {
        some: {
          activityDate: { gte: weekStart }
        }
      }
    },
    select: {
      id: true,
      displayName: true,
      username: true,
      avatarUrl: true,
      activities: {
        where: {
          activityDate: { gte: weekStart }
        },
        select: {
          powerPoints: true
        }
      }
    },
    take: limit * 2 // Get more to ensure we have enough after sorting
  })

  // Calculate total power per user
  const rankedUsers = usersWithPower
    .map(user => ({
      userId: user.id,
      displayName: user.displayName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      power: user.activities.reduce((sum, a) => sum + (a.powerPoints || 0), 0)
    }))
    .sort((a, b) => b.power - a.power)
    .slice(0, limit)

  // Add rank and current user flag
  return rankedUsers.map((user, index) => ({
    rank: index + 1,
    userId: user.userId,
    displayName: user.displayName,
    username: user.username,
    avatarUrl: user.avatarUrl,
    power: user.power,
    isCurrentUser: user.userId === currentUserId
  }))
}

/**
 * Get country-based power ladder for the current week
 */
export async function getCountryLadder(
  country: string,
  currentUserId: string,
  limit: number = 10
): Promise<LadderEntry[]> {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - diff)
  weekStart.setHours(0, 0, 0, 0)

  const usersWithPower = await prisma.user.findMany({
    where: {
      country: country,
      activities: {
        some: {
          activityDate: { gte: weekStart }
        }
      }
    },
    select: {
      id: true,
      displayName: true,
      username: true,
      avatarUrl: true,
      activities: {
        where: {
          activityDate: { gte: weekStart }
        },
        select: {
          powerPoints: true
        }
      }
    },
    take: limit * 2
  })

  const rankedUsers = usersWithPower
    .map(user => ({
      userId: user.id,
      displayName: user.displayName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      power: user.activities.reduce((sum, a) => sum + (a.powerPoints || 0), 0)
    }))
    .sort((a, b) => b.power - a.power)
    .slice(0, limit)

  return rankedUsers.map((user, index) => ({
    rank: index + 1,
    userId: user.userId,
    displayName: user.displayName,
    username: user.username,
    avatarUrl: user.avatarUrl,
    power: user.power,
    isCurrentUser: user.userId === currentUserId
  }))
}

/**
 * Get global power ladder for the current week
 */
export async function getGlobalLadder(
  currentUserId: string,
  limit: number = 10
): Promise<LadderEntry[]> {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - diff)
  weekStart.setHours(0, 0, 0, 0)

  const usersWithPower = await prisma.user.findMany({
    where: {
      activities: {
        some: {
          activityDate: { gte: weekStart }
        }
      }
    },
    select: {
      id: true,
      displayName: true,
      username: true,
      avatarUrl: true,
      activities: {
        where: {
          activityDate: { gte: weekStart }
        },
        select: {
          powerPoints: true
        }
      }
    },
    take: limit * 3
  })

  const rankedUsers = usersWithPower
    .map(user => ({
      userId: user.id,
      displayName: user.displayName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      power: user.activities.reduce((sum, a) => sum + (a.powerPoints || 0), 0)
    }))
    .sort((a, b) => b.power - a.power)
    .slice(0, limit)

  return rankedUsers.map((user, index) => ({
    rank: index + 1,
    userId: user.userId,
    displayName: user.displayName,
    username: user.username,
    avatarUrl: user.avatarUrl,
    power: user.power,
    isCurrentUser: user.userId === currentUserId
  }))
}
