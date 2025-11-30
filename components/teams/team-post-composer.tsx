"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ImageIcon } from "lucide-react"

interface TeamPostComposerProps {
    teamId: string
    slug: string
    isAdmin: boolean
    onPostCreated?: () => void
}

export function TeamPostComposer({ teamId, slug, isAdmin, onPostCreated }: TeamPostComposerProps) {
    const [content, setContent] = useState("")
    const [postType, setPostType] = useState("UPDATE")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            await fetch(`/api/teams/${slug}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content,
                    postType
                })
            })
            setContent("")
            setPostType("UPDATE")
            onPostCreated?.()
        } catch (error) {
            console.error("Error creating team post:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-border-light p-4 mb-6">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share an update with your team..."
                className="min-h-[100px] resize-none border-border-light focus:border-brand-primary mb-3"
            />

            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {isAdmin && (
                        <Select value={postType} onValueChange={setPostType}>
                            <SelectTrigger className="w-[140px] h-9 text-sm">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UPDATE">Update</SelectItem>
                                <SelectItem value="ANNOUNCEMENT">📢 Announcement</SelectItem>
                                <SelectItem value="RESULT">🏆 Result</SelectItem>
                                <SelectItem value="EVENT">📅 Event</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                    <Button variant="ghost" size="sm" className="text-text-secondary">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Photo
                    </Button>
                </div>

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
