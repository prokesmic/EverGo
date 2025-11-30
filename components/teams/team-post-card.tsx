import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface TeamPostCardProps {
    post: {
        id: string
        content: string
        postType: string
        photos: string[] // JSON string or array depending on how it's passed. Assuming parsed array here.
        isPinned: boolean
        createdAt: string
        user: {
            id: string
            displayName: string
            avatarUrl: string | null
        }
    }
}

export function TeamPostCard({ post }: TeamPostCardProps) {
    const isAnnouncement = post.postType === 'ANNOUNCEMENT'
    const photos = typeof post.photos === 'string' ? JSON.parse(post.photos) : post.photos

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-border-light overflow-hidden mb-4 ${isAnnouncement ? 'border-l-4 border-l-brand-blue' : ''
            }`}>
            {/* Header */}
            <div className="flex items-start gap-3 p-4">
                <Avatar className="h-10 w-10 border border-border-light">
                    <AvatarImage src={post.user.avatarUrl || undefined} alt={post.user.displayName} />
                    <AvatarFallback>{post.user.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-text-primary">{post.user.displayName}</span>
                        {post.postType === 'ANNOUNCEMENT' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                Announcement
                            </span>
                        )}
                        {post.postType === 'RESULT' && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                                Result
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-text-muted">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </div>
                </div>

                {post.isPinned && (
                    <span className="text-text-muted" title="Pinned">📌</span>
                )}
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
                <p className="text-text-primary whitespace-pre-wrap">{post.content}</p>

                {photos && photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        {photos.map((photo: string, i: number) => (
                            <img key={i} src={photo} alt={`Post photo ${i + 1}`} className="rounded-lg object-cover w-full h-48" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
