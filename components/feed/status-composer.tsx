"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, MapPin, Loader2, X } from "lucide-react"

interface StatusComposerProps {
    onSubmit?: () => void
}

export function StatusComposer({ onSubmit }: StatusComposerProps) {
    const [content, setContent] = useState("")
    const [photos, setPhotos] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!content.trim() && photos.length === 0) return

        setIsSubmitting(true)
        try {
            await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content,
                    photos,
                    postType: photos.length > 0 ? "PHOTO" : "STATUS"
                })
            })
            setContent("")
            setPhotos([])
            onSubmit?.()
        } catch (error) {
            console.error("Error creating post:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAddPhoto = () => {
        // Mock photo upload for MVP
        const mockPhoto = `https://picsum.photos/seed/${Date.now()}/800/600`
        setPhotos([...photos, mockPhoto])
    }

    return (
        <div className="space-y-4">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share what's on your mind..."
                className="min-h-[100px] resize-none border-border-light focus:border-brand-primary"
            />

            {photos.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                            <img src={photo} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-border-light" />
                            <button
                                onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border-light">
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-text-secondary hover:text-brand-primary"
                        onClick={handleAddPhoto}
                    >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Photo
                    </Button>
                    <Button variant="ghost" size="sm" className="text-text-secondary hover:text-brand-primary">
                        <MapPin className="w-4 h-4 mr-2" />
                        Location
                    </Button>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (!content.trim() && photos.length === 0)}
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
