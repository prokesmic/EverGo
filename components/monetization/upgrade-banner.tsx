import { Star } from "lucide-react"
import Link from "next/link"

interface UpgradeBannerProps {
    feature: string
}

export function UpgradeBanner({ feature }: UpgradeBannerProps) {
    return (
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-4 text-white">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg">
                    <Star className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold mb-1">Unlock {feature}</h3>
                    <p className="text-sm text-white/80 mb-3">
                        Upgrade to EverGo Pro for advanced features, unlimited history, and ad-free experience.
                    </p>
                    <Link
                        href="/settings/subscription"
                        className="inline-block px-4 py-2 bg-white text-purple-600 font-medium rounded-lg hover:bg-white/90"
                    >
                        Upgrade to Pro
                    </Link>
                </div>
            </div>
        </div>
    )
}
