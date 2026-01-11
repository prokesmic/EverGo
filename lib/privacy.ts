import { prisma } from './db'

/**
 * Privacy & Data Retention Utilities (V10)
 *
 * GDPR Compliance:
 * - Right to be forgotten (account deletion)
 * - Data export (portability)
 * - Data anonymization for retained analytics
 *
 * Retention Policy:
 * - Active accounts: indefinite
 * - Deleted accounts: 30 days soft-delete, then hard delete
 * - Activity data: anonymized after account deletion
 * - Audit logs: 90 days
 *
 * Soft-Delete Pattern:
 * - User.deletedAt = timestamp when deletion requested
 * - 30-day grace period for account recovery
 * - Cron job for final deletion after grace period
 */

export const RETENTION_DAYS = {
  SOFT_DELETE_GRACE: 30,
  AUDIT_LOGS: 90,
  SESSION_DATA: 7,
  NOTIFICATIONS_READ: 30,
  NOTIFICATIONS_UNREAD: 90,
}

/**
 * Soft-delete a user account (GDPR: Right to be forgotten)
 * Sets deletedAt timestamp, user can recover within grace period
 */
export async function softDeleteAccount(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      // Clear sensitive fields immediately
      email: `deleted_${userId}@redacted.local`,
      avatarUrl: null,
      coverPhotoUrl: null,
      bio: null,
    },
  })

  // Also soft-delete related data
  await Promise.all([
    // Hide all posts
    prisma.post.updateMany({
      where: { userId },
      data: { visibility: 'PRIVATE' },
    }),
    // Disconnect external integrations
    prisma.stravaConnection.deleteMany({
      where: { userId },
    }),
  ])

  console.log(`[Privacy] Soft-deleted user ${userId}`)
}

/**
 * Restore a soft-deleted account (within grace period)
 */
export async function restoreAccount(userId: string, newEmail: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { deletedAt: true },
  })

  if (!user?.deletedAt) {
    return false // Not deleted
  }

  const daysSinceDeletion = Math.floor(
    (Date.now() - user.deletedAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceDeletion > RETENTION_DAYS.SOFT_DELETE_GRACE) {
    return false // Grace period expired
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: null,
      email: newEmail,
    },
  })

  console.log(`[Privacy] Restored user ${userId}`)
  return true
}

/**
 * Hard-delete user and anonymize their activity data
 * Called by cron after grace period expires
 */
export async function hardDeleteAccount(userId: string): Promise<void> {
  // Anonymize activities (keep for aggregated stats)
  await prisma.activity.updateMany({
    where: { userId },
    data: {
      // Anonymize user reference but keep activity data for stats
      title: 'Deleted Activity',
      description: null,
      photos: '[]',
      gpsRoute: null,
      mapImageUrl: null,
    },
  })

  // Delete user and cascade relations
  await prisma.user.delete({
    where: { id: userId },
  })

  console.log(`[Privacy] Hard-deleted user ${userId}`)
}

/**
 * Export user data (GDPR: Right to data portability)
 */
export async function exportUserData(userId: string): Promise<Record<string, unknown>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      activities: {
        select: {
          id: true,
          title: true,
          description: true,
          activityDate: true,
          durationSeconds: true,
          distanceMeters: true,
          elevationGain: true,
          caloriesBurned: true,
          avgHeartRate: true,
          avgPace: true,
          gpsRoute: true,
          source: true,
          createdAt: true,
        },
      },
      sports: {
        include: { sport: { select: { name: true } } },
      },
      following: {
        include: { following: { select: { username: true, displayName: true } } },
      },
      followers: {
        include: { follower: { select: { username: true, displayName: true } } },
      },
      posts: {
        select: {
          id: true,
          content: true,
          postType: true,
          createdAt: true,
        },
      },
      stats: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      city: user.city,
      country: user.country,
      createdAt: user.createdAt,
    },
    activities: user.activities,
    sports: user.sports.map((s) => s.sport.name),
    following: user.following.map((f) => ({
      username: f.following.username,
      displayName: f.following.displayName,
    })),
    followers: user.followers.map((f) => ({
      username: f.follower.username,
      displayName: f.follower.displayName,
    })),
    posts: user.posts,
    stats: user.stats,
  }
}

/**
 * Process accounts pending hard deletion (cron job)
 */
export async function processExpiredDeletions(): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS.SOFT_DELETE_GRACE)

  const expiredUsers = await prisma.user.findMany({
    where: {
      deletedAt: { lte: cutoffDate },
    },
    select: { id: true },
  })

  for (const user of expiredUsers) {
    await hardDeleteAccount(user.id)
  }

  console.log(`[Privacy] Processed ${expiredUsers.length} expired deletions`)
  return expiredUsers.length
}

/**
 * Clean up old notifications (data retention)
 */
export async function cleanupOldNotifications(): Promise<number> {
  const readCutoff = new Date()
  readCutoff.setDate(readCutoff.getDate() - RETENTION_DAYS.NOTIFICATIONS_READ)

  const unreadCutoff = new Date()
  unreadCutoff.setDate(unreadCutoff.getDate() - RETENTION_DAYS.NOTIFICATIONS_UNREAD)

  const result = await prisma.notification.deleteMany({
    where: {
      OR: [
        { isRead: true, createdAt: { lte: readCutoff } },
        { isRead: false, createdAt: { lte: unreadCutoff } },
      ],
    },
  })

  console.log(`[Privacy] Cleaned up ${result.count} old notifications`)
  return result.count
}

/**
 * Check if user has requested deletion
 */
export async function isAccountDeleted(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { deletedAt: true },
  })
  return !!user?.deletedAt
}

/**
 * Get days remaining in deletion grace period
 */
export async function getDeletionGraceDaysRemaining(userId: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { deletedAt: true },
  })

  if (!user?.deletedAt) return null

  const daysSince = Math.floor(
    (Date.now() - user.deletedAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  return Math.max(0, RETENTION_DAYS.SOFT_DELETE_GRACE - daysSince)
}
