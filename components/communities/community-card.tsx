import Link from "next/link"
import { Users, MapPin } from "lucide-react"

interface CommunityCardProps {
    community: {
        id: string
        name: string
        slug: string
        sport: { name: string } | null
        topic: string | null
        city: string | null
        coverPhotoUrl: string | null
        description: string | null
        memberCount: number
    }
}

export function CommunityCard({ community }: CommunityCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-border-light">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 relative">
                {community.coverPhotoUrl && (
                    <img src={community.coverPhotoUrl} alt={community.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-text-primary text-lg mb-1 truncate" title={community.name}>
                    {community.name}
                </h3>
                <p className="text-sm text-text-secondary mb-2 flex items-center gap-2">
                    <span className="font-medium">{community.sport?.name || community.topic}</span>
                    {community.city && (
                        <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {community.city}
                            </span>
                        </>
                    )}
                </p>

                <p className="text-sm text-text-muted line-clamp-2 mb-4 h-10">
                    {community.description || "No description available."}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-border-light">
                    <span className="text-sm text-text-muted flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {community.memberCount} members
                    </span>
                    <Link
                        href={`/communities/${community.slug}`}
                        className="text-brand-primary text-sm font-medium hover:underline"
                    >
                        View →
                    </Link>
                </div>
            </div>
        </div>
    )
}
