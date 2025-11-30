"use client"

import { useState, useEffect } from "react"
import { CommunityCard } from "@/components/communities/community-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Plus, Loader2 } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce" // Assuming this hook exists or I'll implement simple debounce

export default function CommunitiesPage() {
    const [communities, setCommunities] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [sport, setSport] = useState("all")
    const [city, setCity] = useState("")

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState(search)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        const fetchCommunities = async () => {
            setIsLoading(true)
            try {
                const params = new URLSearchParams()
                if (debouncedSearch) params.append("search", debouncedSearch)
                if (sport && sport !== "all") params.append("sport", sport)
                if (city) params.append("city", city)

                const res = await fetch(`/api/communities?${params.toString()}`)
                const data = await res.json()
                if (data.communities) {
                    setCommunities(data.communities)
                }
            } catch (error) {
                console.error("Error fetching communities:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCommunities()
    }, [debouncedSearch, sport, city])

    return (
        <div className="min-h-screen bg-bg-page pb-20">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">Communities</h1>
                        <p className="text-text-secondary mt-1">Find your tribe and train together</p>
                    </div>
                    <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Community
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-border-light p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                            <Input
                                placeholder="Search communities..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 border-border-light focus:border-brand-primary"
                            />
                        </div>
                        <Select value={sport} onValueChange={setSport}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="All Sports" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sports</SelectItem>
                                <SelectItem value="running">Running</SelectItem>
                                <SelectItem value="cycling">Cycling</SelectItem>
                                <SelectItem value="swimming">Swimming</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="All Locations" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Locations</SelectItem>
                                <SelectItem value="Prague">Prague</SelectItem>
                                <SelectItem value="Brno">Brno</SelectItem>
                                <SelectItem value="Ostrava">Ostrava</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                    </div>
                ) : communities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {communities.map((community) => (
                            <CommunityCard key={community.id} community={community} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-text-muted">
                        No communities found matching your filters.
                    </div>
                )}
            </div>
        </div>
    )
}
