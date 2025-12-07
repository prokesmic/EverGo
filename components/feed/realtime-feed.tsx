"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Feed } from "./feed"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface RealtimeFeedProps {
  type?: "all" | "friends" | "following"
}

export function RealtimeFeed({ type = "all" }: RealtimeFeedProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [pendingUpdates, setPendingUpdates] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!supabase) return

    const client = supabase
    // Subscribe to real-time changes on the Post table
    const channel = client
      .channel("posts-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Post",
        },
        (payload) => {
          console.log("New post created:", payload)
          setPendingUpdates((prev) => prev + 1)

          // Show toast notification for new posts
          if (payload.new) {
            toast.info("New activity posted! Click to refresh.", {
              action: {
                label: "Refresh",
                onClick: handleRefresh,
              },
            })
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Post",
        },
        (payload) => {
          console.log("Post updated:", payload)
          // Auto-refresh for updates (likes, comments)
          setRefreshTrigger((prev) => prev + 1)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "Post",
        },
        (payload) => {
          console.log("Post deleted:", payload)
          // Auto-refresh when posts are deleted
          setRefreshTrigger((prev) => prev + 1)
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status)
        setIsConnected(status === "SUBSCRIBED")
      })

    // Subscribe to Activity table changes
    const activityChannel = client
      .channel("activities-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Activity",
        },
        (payload) => {
          console.log("New activity logged:", payload)
          setPendingUpdates((prev) => prev + 1)
        }
      )
      .subscribe()

    // Subscribe to Like table changes for real-time like updates
    const likeChannel = client
      .channel("likes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Like",
        },
        (payload) => {
          console.log("Like updated:", payload)
          // Auto-refresh to update like counts
          setRefreshTrigger((prev) => prev + 1)
        }
      )
      .subscribe()

    // Subscribe to Comment table changes
    const commentChannel = client
      .channel("comments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Comment",
        },
        (payload) => {
          console.log("Comment updated:", payload)
          // Auto-refresh to update comment counts
          setRefreshTrigger((prev) => prev + 1)
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      channel.unsubscribe()
      activityChannel.unsubscribe()
      likeChannel.unsubscribe()
      commentChannel.unsubscribe()
    }
  }, [type])

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
    setPendingUpdates(0)
    toast.success("Feed refreshed!")
  }, [])

  return (
    <div className="space-y-4">
      {/* Real-time status indicator */}
      <div className="flex items-center justify-between bg-surface-secondary rounded-lg px-4 py-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          />
          <span className="text-sm text-text-muted">
            {isConnected ? "Real-time updates active" : "Connecting..."}
          </span>
        </div>

        {pendingUpdates > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {pendingUpdates} new {pendingUpdates === 1 ? "update" : "updates"}
          </Button>
        )}
      </div>

      {/* Feed component */}
      <Feed type={type} refreshTrigger={refreshTrigger} />
    </div>
  )
}
