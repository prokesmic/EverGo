"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, User, Users, Trophy } from "lucide-react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SearchResult {
    users: Array<{ id: string, displayName: string, username: string, avatarUrl: string | null }>
    teams: Array<{ id: string, name: string, logoUrl: string | null, sport: { name: string } }>
    challenges: Array<{ id: string, title: string, targetType: string }>
}

export function SearchCommand() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [results, setResults] = React.useState<SearchResult | null>(null)
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    React.useEffect(() => {
        if (query.length < 2) {
            setResults(null)
            return
        }

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
                const data = await res.json()
                setResults(data)
            } catch (error) {
                console.error("Search failed", error)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleSelect = (path: string) => {
        setOpen(false)
        router.push(path)
    }

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 border-none bg-black/20 text-white hover:bg-black/30 hover:text-white"
                onClick={() => setOpen(true)}
            >
                <Search className="h-4 w-4 xl:mr-2" />
                <span className="hidden xl:inline-flex">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 xl:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." value={query} onValueChange={setQuery} />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {results?.users && results.users.length > 0 && (
                        <CommandGroup heading="Users">
                            {results.users.map((user) => (
                                <CommandItem key={user.id} onSelect={() => handleSelect(`/profile/${user.username || user.id}`)}>
                                    <User className="mr-2 h-4 w-4" />
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={user.avatarUrl || ""} />
                                            <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.displayName}</span>
                                        <span className="text-muted-foreground text-xs">@{user.username}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                    {results?.teams && results.teams.length > 0 && (
                        <CommandGroup heading="Teams">
                            {results.teams.map((team) => (
                                <CommandItem key={team.id} onSelect={() => handleSelect(`/teams/${team.id}`)}>
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>{team.name}</span>
                                    <span className="ml-2 text-muted-foreground text-xs">({team.sport?.name})</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                    {results?.challenges && results.challenges.length > 0 && (
                        <CommandGroup heading="Challenges">
                            {results.challenges.map((challenge) => (
                                <CommandItem key={challenge.id} onSelect={() => handleSelect(`/challenges`)}>
                                    <Trophy className="mr-2 h-4 w-4" />
                                    <span>{challenge.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}
