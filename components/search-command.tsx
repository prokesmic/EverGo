"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Search, User, Users, Trophy, Home, Target, Calendar, PlusCircle,
    Settings, Bell, Award, TrendingUp, Zap
} from "lucide-react"
import {
    CommandDialog, CommandEmpty, CommandGroup, CommandInput,
    CommandItem, CommandList, CommandSeparator, CommandShortcut
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SearchResult {
    users: Array<{ id: string, displayName: string, username: string, avatarUrl: string | null }>
    teams: Array<{ id: string, name: string, logoUrl: string | null, sport: { name: string } }>
    challenges: Array<{ id: string, title: string, targetType: string }>
}

const quickActions = [
    { id: 'log-activity', label: 'Log Activity', icon: PlusCircle, path: '/activity/create', shortcut: 'L' },
    { id: 'home', label: 'Go to Home', icon: Home, path: '/home', shortcut: 'H' },
    { id: 'rankings', label: 'View Rankings', icon: Trophy, path: '/rankings', shortcut: 'R' },
    { id: 'challenges', label: 'Browse Challenges', icon: Target, path: '/challenges', shortcut: 'C' },
    { id: 'teams', label: 'Find Teams', icon: Users, path: '/teams', shortcut: 'T' },
    { id: 'calendar', label: 'View Events', icon: Calendar, path: '/calendar', shortcut: 'E' },
]

const userActions = [
    { id: 'profile', label: 'My Profile', icon: User, path: '/profile/me' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
]

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

            // Quick shortcuts when command palette is open
            if (open && !query) {
                const action = quickActions.find(a => a.shortcut?.toLowerCase() === e.key.toLowerCase())
                if (action && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleSelect(action.path)
                }
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [open, query])

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
        setQuery("")
        router.push(path)
    }

    const hasSearchResults = results && (
        (results.users && results.users.length > 0) ||
        (results.teams && results.teams.length > 0) ||
        (results.challenges && results.challenges.length > 0)
    )

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 border-none bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => setOpen(true)}
            >
                <Search className="h-4 w-4 xl:mr-2" />
                <span className="hidden xl:inline-flex">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white/70 xl:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Search or type a command..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    {!query && (
                        <>
                            <CommandGroup heading="Quick Actions">
                                {quickActions.map((action) => (
                                    <CommandItem
                                        key={action.id}
                                        onSelect={() => handleSelect(action.path)}
                                        className="flex items-center gap-2"
                                    >
                                        <action.icon className="h-4 w-4 text-muted-foreground" />
                                        <span>{action.label}</span>
                                        {action.shortcut && (
                                            <CommandShortcut>⌘{action.shortcut}</CommandShortcut>
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup heading="Account">
                                {userActions.map((action) => (
                                    <CommandItem
                                        key={action.id}
                                        onSelect={() => handleSelect(action.path)}
                                        className="flex items-center gap-2"
                                    >
                                        <action.icon className="h-4 w-4 text-muted-foreground" />
                                        <span>{action.label}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </>
                    )}

                    {query && !hasSearchResults && (
                        <CommandEmpty>
                            <div className="flex flex-col items-center gap-2 py-6">
                                <Search className="h-8 w-8 text-muted-foreground/50" />
                                <p className="text-muted-foreground">No results found for "{query}"</p>
                                <p className="text-xs text-muted-foreground/70">Try searching for users, teams, or challenges</p>
                            </div>
                        </CommandEmpty>
                    )}

                    {results?.users && results.users.length > 0 && (
                        <CommandGroup heading="Users">
                            {results.users.map((user) => (
                                <CommandItem
                                    key={user.id}
                                    onSelect={() => handleSelect(`/profile/${user.username || user.id}`)}
                                    className="flex items-center gap-3"
                                >
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={user.avatarUrl || ""} />
                                        <AvatarFallback className="text-xs">{user.displayName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user.displayName}</span>
                                        <span className="text-xs text-muted-foreground">@{user.username}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {results?.teams && results.teams.length > 0 && (
                        <CommandGroup heading="Teams">
                            {results.teams.map((team) => (
                                <CommandItem
                                    key={team.id}
                                    onSelect={() => handleSelect(`/teams/${team.id}`)}
                                    className="flex items-center gap-3"
                                >
                                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{team.name}</span>
                                        <span className="text-xs text-muted-foreground">{team.sport?.name}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {results?.challenges && results.challenges.length > 0 && (
                        <CommandGroup heading="Challenges">
                            {results.challenges.map((challenge) => (
                                <CommandItem
                                    key={challenge.id}
                                    onSelect={() => handleSelect(`/challenges/${challenge.id}`)}
                                    className="flex items-center gap-3"
                                >
                                    <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                                        <Trophy className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <span className="font-medium">{challenge.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}
