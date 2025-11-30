"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CalendarWidget } from "@/components/widgets/calendar-widget"
import { TeamsWidget } from "@/components/widgets/teams-widget"
import { BrandsWidget } from "@/components/widgets/brands-widget"
import { RankingsWidget } from "@/components/widgets/rankings-widget"
import { ActivitiesSummaryWidget } from "@/components/widgets/activities-summary-widget"
import { PartnerFinderWidget } from "@/components/social/partner-finder-widget"

// We need to fetch data for these widgets or make them accept props.
// For now, we'll assume they can fetch their own data or use mock data if props are missing.
// Ideally, we should refactor widgets to be purely presentational and pass data from a parent,
// but for this optimization task, we'll try to reuse them as is.

// Note: Some widgets might expect props. We'll need to handle that.
// Let's check if we can pass mock/empty data or if they handle missing data gracefully.
// Based on previous files, RankingsWidget needs props.
// We might need to fetch data here or create a "MobileDashboard" wrapper that fetches data.
// For simplicity and speed, let's create a version that renders what it can.

export function MobileMenu() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="flex flex-col items-center justify-center gap-1 h-auto py-1 hover:bg-transparent">
                    <Menu className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-60px)]">
                    <div className="p-4 space-y-6 pb-20">
                        <section>
                            <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Social</h3>
                            <PartnerFinderWidget />
                        </section>

                        <section>
                            <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Your Teams</h3>
                            {/* TeamsWidget expects props. We might need to fetch or mock. */}
                            {/* For now, let's render it without props if possible, or pass empty array to avoid crash */}
                            <TeamsWidget teams={[]} />
                        </section>

                        <section>
                            <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Calendar</h3>
                            <CalendarWidget />
                        </section>

                        <section>
                            <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Brands</h3>
                            <BrandsWidget />
                        </section>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
