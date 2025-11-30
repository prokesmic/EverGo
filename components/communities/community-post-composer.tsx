"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ImageIcon } from "lucide-react"

interface CommunityPostComposerProps {
    communityId: string
    slug: string
    onPostCreated?: () => void
}

export function CommunityPostComposer({ communityId, slug, onPostCreated }: CommunityPostComposerProps) {
    const [content, setContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            await fetch(`/api/communities/${slug}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content
                })
            })
            setContent("")
            onPostCreated?.()
        } catch (error) {
            console.error("Error creating community post:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-border-light p-4 mb-6">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start a discussion..."
                className="min-h-[100px] resize-none border-border-light focus:border-brand-primary mb-3"
            />

            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-text-secondary">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Photo
                </Button>

                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !content.trim()}
                    className="bg-brand-primary hover:bg-brand-primary-dark text-white"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Posting...
                        </>
                    ) : (
                        "Post"
                    )}
                </Button>
            </div>
        </div>
    )
}
