import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageGridProps {
    children: ReactNode
    leftSidebar?: ReactNode
    rightSidebar?: ReactNode
    className?: string
    /** Show sidebars on mobile as stacked sections */
    showSidebarsOnMobile?: boolean
}

export function PageGrid({
    children,
    leftSidebar,
    rightSidebar,
    className,
    showSidebarsOnMobile = false,
}: PageGridProps) {
    const mainColSpan = leftSidebar && rightSidebar
        ? "lg:col-span-6"
        : leftSidebar || rightSidebar
            ? "lg:col-span-9"
            : "lg:col-span-12"

    return (
        <div className={cn("max-w-[1400px] mx-auto px-4 sm:px-6 pb-6 pt-4", className)}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                {/* Left Sidebar - Contextual filters and widgets */}
                {leftSidebar && (
                    <aside className={cn(
                        "lg:col-span-3 space-y-4",
                        !showSidebarsOnMobile && "hidden lg:block"
                    )}>
                        <div className="lg:sticky lg:top-20 space-y-4">
                            {leftSidebar}
                        </div>
                    </aside>
                )}

                {/* Main Content - Center canvas */}
                <main className={cn("col-span-1 space-y-4", mainColSpan)}>
                    {children}
                </main>

                {/* Right Sidebar - Assist panels */}
                {rightSidebar && (
                    <aside className={cn(
                        "lg:col-span-3 space-y-4",
                        !showSidebarsOnMobile && "hidden lg:block"
                    )}>
                        <div className="lg:sticky lg:top-20 space-y-4">
                            {rightSidebar}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    )
}
