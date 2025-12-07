"use client"

import { useEffect, useState, useCallback } from 'react'
import { supabase, TABLES, isSupabaseConfigured } from '@/lib/supabase'
import { toast } from 'sonner'

interface Post {
  id: string
  userId: string
  content: string | null
  createdAt: string
  user?: {
    displayName: string
    avatarUrl: string | null
  }
}

interface UseRealtimeFeedOptions {
  onNewPost?: (post: Post) => void
  onPostUpdate?: (post: Post) => void
  onPostDelete?: (postId: string) => void
  enabled?: boolean
}

export function useRealtimeFeed(options: UseRealtimeFeedOptions = {}) {
  const { onNewPost, onPostUpdate, onPostDelete, enabled = true } = options
  const [isConnected, setIsConnected] = useState(false)
  const [newPostsCount, setNewPostsCount] = useState(0)

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured() || !supabase) {
      return
    }

    const client = supabase
    const channel = client
      .channel('feed-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.POSTS,
        },
        (payload) => {
          const newPost = payload.new as Post
          setNewPostsCount((prev) => prev + 1)
          onNewPost?.(newPost)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: TABLES.POSTS,
        },
        (payload) => {
          const updatedPost = payload.new as Post
          onPostUpdate?.(updatedPost)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: TABLES.POSTS,
        },
        (payload) => {
          const deletedPost = payload.old as { id: string }
          onPostDelete?.(deletedPost.id)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false)
        }
      })

    return () => {
      client.removeChannel(channel)
    }
  }, [enabled, onNewPost, onPostUpdate, onPostDelete])

  const clearNewPostsCount = useCallback(() => {
    setNewPostsCount(0)
  }, [])

  return {
    isConnected,
    newPostsCount,
    clearNewPostsCount,
  }
}

// Hook for realtime notifications
export function useRealtimeNotifications(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId || !isSupabaseConfigured() || !supabase) {
      return
    }

    const client = supabase
    const channel = client
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.NOTIFICATIONS,
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          setUnreadCount((prev) => prev + 1)
          const notification = payload.new as { type: string; message?: string }

          // Show toast for new notifications
          toast.info(notification.message || 'New notification', {
            action: {
              label: 'View',
              onClick: () => window.location.href = '/notifications'
            }
          })
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [userId])

  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0)
  }, [])

  return {
    unreadCount,
    clearUnreadCount,
  }
}

// Hook for realtime activity updates (likes, comments)
export function useRealtimeActivity(postId: string) {
  const [likesCount, setLikesCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)

  useEffect(() => {
    if (!postId || !isSupabaseConfigured() || !supabase) {
      return
    }

    const client = supabase
    const likesChannel = client
      .channel(`likes-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.LIKES,
          filter: `postId=eq.${postId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLikesCount((prev) => prev + 1)
          } else if (payload.eventType === 'DELETE') {
            setLikesCount((prev) => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    const commentsChannel = client
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.COMMENTS,
          filter: `postId=eq.${postId}`,
        },
        () => {
          setCommentsCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(likesChannel)
      client.removeChannel(commentsChannel)
    }
  }, [postId])

  return {
    likesCount,
    commentsCount,
    setLikesCount,
    setCommentsCount,
  }
}
