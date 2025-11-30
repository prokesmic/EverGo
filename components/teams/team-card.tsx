import Link from "next/link"
import { Trophy, Users, MapPin } from "lucide-react"

interface TeamCardProps {
    team: {
        id: string
        name: string
        slug: string
        sport: { name: string, icon: string }
        city: string | null
        country: string | null
        logoUrl: string | null
        coverPhotoUrl: string | null
        memberCount: number
        globalRank: number | null
        isVerified: boolean
    }
}

export function TeamCard({ team }: TeamCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-border-light">
            {/* Cover Image */}
            <div className="h-24 bg-gradient-to-r from-brand-blue to-blue-600 relative">
                {team.coverPhotoUrl && (
                    <img src={team.coverPhotoUrl} alt={team.name} className="w-full h-full object-cover" />
                )}
                {/* Logo */}
                <div className="absolute -bottom-6 left-4">
                    <div className="w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center overflow-hidden border-2 border-white">
                        {team.logoUrl ? (
                            <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl">{team.sport.icon}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="pt-8 p-4">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="font-bold text-text-primary text-lg leading-tight truncate pr-2" title={team.name}>
                            {team.name}
                        </h3>
                        <div className="flex items-center text-sm text-text-secondary mt-1">
                            <span className="mr-2">{team.sport.name}</span>
                            {(team.city || team.country) && (
                                <>
                                    <span className="mx-1">•</span>
                                    <MapPin className="w-3 h-3 mr-1" />
                                    <span className="truncate max-w-[100px]">{team.city || team.country}</span>
                                </>
                            )}
                        </div>
                    </div>
                    {team.isVerified && (
                        <span className="text-brand-primary" title="Verified Team">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </span>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-3 flex items-center gap-4 text-sm text-text-muted">
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{team.memberCount} members</span>
                    </div>
                    {team.globalRank && (
                        <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <span className="font-medium text-text-primary">#{team.globalRank}</span>
                        </div>
                    )}
                </div>

                {/* Action */}
                <Link
                    href={`/teams/${team.slug}`}
                    className="mt-4 block w-full py-2 text-center bg-bg-page text-text-primary border border-border-light rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                    View Team
                </Link>
            </div>
        </div>
    )
}
