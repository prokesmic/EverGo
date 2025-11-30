import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Sport } from "@prisma/client"

interface SportTabsProps {
    sports: Sport[]
    selectedSportId: string | null
    onSelectSport: (sportId: string | null) => void
}

export function SportTabs({ sports, selectedSportId, onSelectSport }: SportTabsProps) {
    return (
        <div className="w-full border-b bg-background sticky top-14 z-30">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-4 p-4">
                    <button
                        onClick={() => onSelectSport(null)}
                        className={`text-sm font-medium transition-colors hover:text-primary ${selectedSportId === null
                                ? "text-primary border-b-2 border-primary pb-1"
                                : "text-muted-foreground"
                            }`}
                    >
                        All Activities
                    </button>
                    {sports.map((sport) => (
                        <button
                            key={sport.id}
                            onClick={() => onSelectSport(sport.id)}
                            className={`text-sm font-medium transition-colors hover:text-primary ${selectedSportId === sport.id
                                    ? "text-primary border-b-2 border-primary pb-1"
                                    : "text-muted-foreground"
                                }`}
                        >
                            {sport.name}
                        </button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}
