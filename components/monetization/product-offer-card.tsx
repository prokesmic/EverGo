"use client"

import { X } from "lucide-react"
import { useState } from "react"

interface ProductOffer {
    id: string
    title: string
    description: string
    brand: string
    productUrl: string
    imageUrl: string
    originalPrice: number
    salePrice: number | null
    discountCode: string | null
    reason?: string
}

interface ProductOfferCardProps {
    offer: ProductOffer
}

export function ProductOfferCard({ offer }: ProductOfferCardProps) {
    const [isVisible, setIsVisible] = useState(true)

    const handleClick = async () => {
        await fetch('/api/offers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ offerId: offer.id, action: 'click' })
        })
        window.open(offer.productUrl, '_blank')
    }

    const handleDismiss = async () => {
        setIsVisible(false)
        await fetch('/api/offers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ offerId: offer.id, action: 'dismiss' })
        })
    }

    if (!isVisible) return null

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            {/* Sponsored Label */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Sponsored</span>
                <button
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex gap-4">
                    <img
                        src={offer.imageUrl}
                        alt={offer.title}
                        className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            {offer.brand}
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-1">{offer.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{offer.description}</p>

                        {/* Price */}
                        <div className="mt-2 flex items-center gap-2">
                            {offer.salePrice ? (
                                <>
                                    <span className="font-bold text-green-600">${offer.salePrice}</span>
                                    <span className="text-sm text-gray-400 line-through">${offer.originalPrice}</span>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                        {Math.round((1 - offer.salePrice / offer.originalPrice) * 100)}% off
                                    </span>
                                </>
                            ) : (
                                <span className="font-bold text-gray-800">${offer.originalPrice}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={handleClick}
                    className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
                >
                    View Deal
                </button>
            </div>
        </div>
    )
}
