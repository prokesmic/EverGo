"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Send, MoreVertical, Edit2, Trash2, Reply as ReplyIcon, Loader2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    displayName: string
    username: string | null
    avatarUrl: string | null
  }
  isLikedByMe?: boolean
  likesCount: number
  repliesCount?: number
  replies?: Comment[]
}

interface CommentsSectionProps {
  postId: string
  initialComments?: Comment[]
}

export function CommentsSection({ postId, initialComments = [] }: CommentsSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch comments
  useEffect(() => {
    fetchComments()
  }, [postId])

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Comment",
          filter: `postId=eq.${postId}`,
        },
        (payload) => {
          console.log("New comment added:", payload)
          fetchComments() // Refresh comments
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "Comment",
        },
        (payload) => {
          console.log("Comment deleted:", payload)
          fetchComments() // Refresh comments
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [postId])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      const data = await response.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent, parentCommentId?: string) => {
    e.preventDefault()

    const content = parentCommentId ? replyContent : newComment

    if (!content.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          parentCommentId,
        }),
      })

      if (!response.ok) throw new Error("Failed to post comment")

      const { comment } = await response.json()

      if (parentCommentId) {
        setReplyContent("")
        setReplyingTo(null)
      } else {
        setNewComment("")
      }

      toast.success("Comment posted!")
      fetchComments() // Refresh to show new comment
    } catch (error) {
      console.error("Error posting comment:", error)
      toast.error("Failed to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    try {
      const method = isLiked ? "DELETE" : "POST"
      await fetch(`/api/comments/${commentId}/like`, { method })

      // Optimistic update
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isLikedByMe: !isLiked,
              likesCount: isLiked ? comment.likesCount - 1 : comment.likesCount + 1,
            }
          }

          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === commentId
                  ? {
                      ...reply,
                      isLikedByMe: !isLiked,
                      likesCount: isLiked ? reply.likesCount - 1 : reply.likesCount + 1,
                    }
                  : reply
              ),
            }
          }

          return comment
        })
      )
    } catch (error) {
      console.error("Error liking comment:", error)
      toast.error("Failed to like comment")
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete comment")

      toast.success("Comment deleted")
      fetchComments()
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("Failed to delete comment")
    }
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const initials = comment.user.displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)

    const isOwnComment = session?.user?.email && comment.user.username === session.user.name

    return (
      <div className={`flex gap-3 ${isReply ? "ml-12" : ""}`}>
        <Link href={`/profile/${comment.user.username || comment.user.id}`}>
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={comment.user.avatarUrl || undefined} alt={comment.user.displayName} />
            <AvatarFallback className="text-xs bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="bg-surface-secondary rounded-2xl px-4 py-2">
            <div className="flex items-center justify-between mb-1">
              <Link
                href={`/profile/${comment.user.username || comment.user.id}`}
                className="font-semibold text-sm text-text-primary hover:underline"
              >
                {comment.user.displayName}
              </Link>

              {isOwnComment && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <p className="text-sm text-text-primary whitespace-pre-wrap break-words">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 mt-1 px-2">
            <button
              onClick={() => handleLikeComment(comment.id, comment.isLikedByMe || false)}
              className={`text-xs font-semibold ${
                comment.isLikedByMe ? "text-red-500" : "text-text-muted hover:text-red-500"
              } transition-colors`}
            >
              {comment.isLikedByMe ? "Liked" : "Like"}
              {comment.likesCount > 0 && ` · ${comment.likesCount}`}
            </button>

            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-xs font-semibold text-text-muted hover:text-brand-primary transition-colors"
              >
                Reply
              </button>
            )}

            <time className="text-xs text-text-muted">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</time>
          </div>

          {/* Reply form */}
          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleSubmitComment(e, comment.id)} className="mt-3">
              <div className="flex gap-2">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || "User"} />
                  <AvatarFallback className="text-xs">
                    {session?.user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${comment.user.displayName}...`}
                    className="min-h-[60px] resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <Button type="submit" size="sm" disabled={isSubmitting || !replyContent.trim()}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reply"}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-8 text-text-muted">
        <p>Please log in to view and post comments</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comment composer */}
      <form onSubmit={(e) => handleSubmitComment(e)} className="flex gap-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
          <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[80px] resize-none rounded-2xl"
          />
          <div className="flex justify-end mt-2">
            <Button type="submit" disabled={isSubmitting || !newComment.trim()} className="gap-2">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}
