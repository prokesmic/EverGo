"use client"

import { useState, useEffect } from "react"
import { Bell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    isRead: boolean
    createdAt: string
    data?: string
}

export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchUnreadCount()
        // Poll for unread count every minute
        const interval = setInterval(fetchUnreadCount, 60000)
        return () => clearInterval(interval)
    }, [])

    const fetchUnreadCount = async () => {
        try {
            const res = await fetch("/api/notifications?unreadOnly=true&limit=1")
            const data = await res.json()
            setUnreadCount(data.unreadCount)
        } catch (error) {
            console.error("Failed to fetch unread count", error)
        }
    }

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications?limit=5")
            const data = await res.json()
            setNotifications(data.notifications)
        } catch (error) {
            console.error("Failed to fetch notifications", error)
        }
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (open) {
            fetchNotifications()
        }
    }

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: "PUT" })
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
            setUnreadCount(Math.max(0, unreadCount - 1))
        } catch (error) {
            console.error("Failed to mark as read", error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await fetch("/api/notifications/read-all", { method: "PUT" })
            setNotifications(notifications.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Failed to mark all as read", error)
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

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-blue-600" onClick={markAllAsRead}>
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem key={notification.id} className="cursor-pointer p-3 items-start gap-3" onSelect={(e) => e.preventDefault()}>
                                <span className="text-xl mt-0.5">{getIcon(notification.type)}</span>
                                <div className="flex-1 space-y-1" onClick={() => {
                                    if (!notification.isRead) markAsRead(notification.id)
                                    // Navigate based on data if needed
                                }}>
                                    <p className={`text-sm ${!notification.isRead ? "font-medium text-gray-900" : "text-gray-600"}`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer justify-center text-blue-600" onSelect={() => router.push("/notifications")}>
                    View all notifications
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
