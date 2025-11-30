"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ActivityPostCard } from "./activity-post-card"
import { Loader2 } from "lucide-react"

interface FeedProps {
    type?: "all" | "friends" | "following"
    refreshTrigger?: number // Prop to trigger refresh
}

export function Feed({ type = "all", refreshTrigger }: FeedProps) {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const observer = useRef<IntersectionObserver | null>(null)

    const fetchPosts = useCallback(async (pageNum: number, reset = false) => {
        try {
            const res = await fetch(`/api/feed?type=${type}&page=${pageNum}&limit=10`)
            const data = await res.json()

            if (reset) {
                setPosts(data.posts)
            } else {
                setPosts(prev => [...prev, ...data.posts])
            }

            setHasMore(data.hasMore)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching feed:", error)
            setLoading(false)
        }
    }, [type])

    useEffect(() => {
        setPage(1)
        setLoading(true)
        fetchPosts(1, true)
    }, [fetchPosts, refreshTrigger])

    const lastPostElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return
        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1
                    fetchPosts(nextPage)
                    return nextPage
                })
            }
        })

        if (node) observer.current.observe(node)
    }, [loading, hasMore, fetchPosts])

    if (loading && posts.length === 0) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-border-light">
                <div className="text-4xl mb-3">📭</div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">No posts yet</h3>
                <p className="text-text-secondary">Be the first to share your activity!</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {posts.map((post, index) => {
                if (posts.length === index + 1) {
                    return (
                        <div ref={lastPostElementRef} key={post.id}>
                            <ActivityPostCard post={post} />
                        </div>
                    )
                } else {
                    return <ActivityPostCard key={post.id} post={post} />
                }
            })}

            {loading && (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                </div>
            )}

            {!hasMore && posts.length > 0 && (
                <div className="text-center py-8 text-text-muted text-sm">
                    You're all caught up! 🎉
                </div>
            )}
        </div>
    )
}
