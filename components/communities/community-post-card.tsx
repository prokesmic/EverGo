import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Heart } from "lucide-react"

interface CommunityPostCardProps {
    post: {
        id: string
        content: string
        photos: string[]
        likesCount: number
        commentsCount: number
        createdAt: string
        user: {
            id: string
            displayName: string
            avatarUrl: string | null
        }
    }
}

export function CommunityPostCard({ post }: CommunityPostCardProps) {
    const photos = typeof post.photos === 'string' ? JSON.parse(post.photos) : post.photos

    return (
        <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden mb-4">
            {/* Header */}
            <div className="flex items-start gap-3 p-4">
                <Avatar className="h-10 w-10 border border-border-light">
                    <AvatarImage src={post.user.avatarUrl || undefined} alt={post.user.displayName} />
                    <AvatarFallback>{post.user.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="font-semibold text-text-primary">{post.user.displayName}</div>
                    <div className="text-xs text-text-muted">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-2">
                <p className="text-text-primary whitespace-pre-wrap">{post.content}</p>

                {photos && photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        {photos.map((photo: string, i: number) => (
                            <img key={i} src={photo} alt={`Post photo ${i + 1}`} className="rounded-lg object-cover w-full h-48" />
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-4 py-3 flex items-center gap-6 border-t border-border-light mt-2">
                <button className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand-primary transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>{post.likesCount}</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand-primary transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentsCount}</span>
                </button>
            </div>
        </div>
    )
}
