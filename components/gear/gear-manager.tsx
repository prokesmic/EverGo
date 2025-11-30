"use client"

import { useState, useEffect } from "react"
import { GearCard } from "./gear-card"
import { AddGearModal } from "./add-gear-modal"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function GearManager() {
    const [gear, setGear] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)

    const fetchGear = async () => {
        try {
            const res = await fetch('/api/gear')
            if (res.ok) {
                const data = await res.json()
                setGear(data)
            }
        } catch (error) {
            console.error('Failed to fetch gear', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchGear()
    }, [])

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Gear</h1>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-500 hover:bg-blue-600"
                >
                    + Add Gear
                </Button>
            </div>

            {/* Active Gear */}
            <div className="space-y-4">
                {gear.filter(g => !g.isRetired).length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        No gear added yet. Add your shoes, bike, or other equipment to track usage.
                    </div>
                )}
                {gear.filter(g => !g.isRetired).map((item) => (
                    <GearCard key={item.id} gear={item} />
                ))}
            </div>

            {/* Retired Gear */}
            {gear.some(g => g.isRetired) && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Retired Gear</h2>
                    <div className="space-y-4 opacity-60">
                        {gear.filter(g => g.isRetired).map((item) => (
                            <GearCard key={item.id} gear={item} />
                        ))}
                    </div>
                </div>
            )}

            <AddGearModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onGearAdded={fetchGear}
            />
        </div>
    )
}
