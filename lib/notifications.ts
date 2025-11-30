import { prisma } from "@/lib/db"

export type NotificationType =
    | 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION'
    | 'RANK_UP' | 'RANK_DOWN' | 'FRIEND_OVERTAKE' | 'MILESTONE_RANK'
    | 'STREAK_REMINDER' | 'STREAK_BROKEN' | 'STREAK_MILESTONE'
    | 'CHALLENGE_JOINED' | 'CHALLENGE_PROGRESS' | 'CHALLENGE_ENDING' | 'CHALLENGE_COMPLETED'
    | 'BADGE_EARNED'
    | 'TEAM_INVITE' | 'TEAM_JOIN_REQUEST' | 'TEAM_POST'
    | 'WEEKLY_SUMMARY' | 'PRODUCT_UPDATE'
    | 'GEAR_REPLACEMENT'

interface CreateNotificationParams {
    userId: string
    type: NotificationType
    title: string
    message: string
    data?: any
}

export async function createNotification({ userId, type, title, message, data }: CreateNotificationParams) {
    try {
        // 1. Check user settings
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { notificationSettings: true }
        })

        if (!user) return

        const settings = user.notificationSettings
        if (settings) {
            // Check category toggles
            if (['LIKE', 'COMMENT', 'FOLLOW', 'MENTION'].includes(type) && !settings.socialEnabled) return
            if (['RANK_UP', 'RANK_DOWN', 'FRIEND_OVERTAKE'].includes(type) && !settings.rankingEnabled) return
            if (type.startsWith('STREAK') && !settings.streakEnabled) return
            if (type.startsWith('CHALLENGE') && !settings.challengeEnabled) return
            if (type.startsWith('TEAM') && !settings.teamEnabled) return
            if (['PRODUCT_UPDATE'].includes(type) && !settings.marketingEnabled) return

            // Check quiet hours (simple check, can be improved with timezone handling)
            if (settings.quietHoursEnabled && settings.quietHoursStart && settings.quietHoursEnd) {
                const now = new Date()
                const currentHour = now.getHours()
                const startHour = parseInt(settings.quietHoursStart.split(':')[0])
                const endHour = parseInt(settings.quietHoursEnd.split(':')[0])

                if (startHour > endHour) {
                    // Overnight quiet hours (e.g. 22:00 - 08:00)
                    if (currentHour >= startHour || currentHour < endHour) return
                } else {
                    // Same day quiet hours (e.g. 09:00 - 17:00)
                    if (currentHour >= startHour && currentHour < endHour) return
                }
            }
        }

        // 2. Create in-app notification
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data: data ? JSON.stringify(data) : null
            }
        })

        // 3. Push notification (Placeholder)
        if (settings?.pushEnabled) {
            await sendPushNotification(userId, title, message, data)
        }

        return notification
    } catch (error) {
        console.error("Error creating notification:", error)
    }
}

async function sendPushNotification(userId: string, title: string, message: string, data?: any) {
    // Placeholder for push notification logic (e.g., Firebase Cloud Messaging, Expo Push)
    // 1. Fetch user's push tokens
    // 2. Send payload to push service
    console.log(`[PUSH] To ${userId}: ${title} - ${message}`)
}

// --- Triggers ---

export async function notifyPostLike(postId: string, likerId: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post || post.userId === likerId) return

    const liker = await prisma.user.findUnique({ where: { id: likerId } })
    if (!liker) return

    await createNotification({
        userId: post.userId,
        type: 'LIKE',
        title: 'New Like',
        message: `${liker.displayName || 'Someone'} liked your post`,
        data: { postId, likerId }
    })
}

export async function notifyComment(postId: string, commenterId: string, commentText: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post || post.userId === commenterId) return

    const commenter = await prisma.user.findUnique({ where: { id: commenterId } })
    if (!commenter) return

    await createNotification({
        userId: post.userId,
        type: 'COMMENT',
        title: 'New Comment',
        message: `${commenter.displayName || 'Someone'} commented: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
        data: { postId, commenterId }
    })
}

export async function notifyBadgeEarned(userId: string, badgeId: string) {
    const badge = await prisma.badge.findUnique({ where: { id: badgeId } })
    if (!badge) return

    await createNotification({
        userId,
        type: 'BADGE_EARNED',
        title: 'Badge Earned! 🎖️',
        message: `You earned the "${badge.name}" badge!`,
        data: { badgeId }
    })
}

export async function notifyChallengeJoined(userId: string, challengeId: string) {
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
    if (!challenge) return

    await createNotification({
        userId,
        type: 'CHALLENGE_JOINED',
        title: 'Challenge Joined',
        message: `You've joined "${challenge.title}". Good luck!`,
        data: { challengeId }
    })
}
