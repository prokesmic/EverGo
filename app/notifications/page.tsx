"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    isRead: boolean
    createdAt: string
    data?: string
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications?limit=50")
            const data = await res.json()
            setNotifications(data.notifications)
        } catch (error) {
            console.error("Failed to fetch notifications", error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: "PUT" })
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
        } catch (error) {
            console.error("Failed to mark as read", error)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'LIKE': return '❤️'
            case 'COMMENT': return '💬'
            case 'FOLLOW': return '👤'
            case 'RANK_UP': return '📈'
            case 'RANK_DOWN': return '📉'
            case 'FRIEND_OVERTAKE': return '🏃'
            case 'STREAK_REMINDER': return '🔥'
            case 'STREAK_MILESTONE': return '🔥'
            case 'CHALLENGE_COMPLETED': return '🏆'
            case 'BADGE_EARNED': return '🎖️'
            case 'TEAM_INVITE': return '👥'
            case 'WEEKLY_SUMMARY': return '📊'
            default: return '🔔'
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
    }

    return (
        <div className="max-w-2xl mx-auto py-6 space-y-6">
            <h1 className="text-2xl font-bold">Notifications</h1>

            <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No notifications yet
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                            onClick={() => !notification.isRead && markAsRead(notification.id)}
                        >
                            <span className="text-2xl mt-1">{getIcon(notification.type)}</span>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!notification.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                                    {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                            {!notification.isRead && (
                                <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-2" />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
