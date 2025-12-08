import { ReactNode } from "react"

interface PageGridProps {
    children: ReactNode
    leftSidebar?: ReactNode
    rightSidebar?: ReactNode
    className?: string
}

export function PageGrid({ children, leftSidebar, rightSidebar, className }: PageGridProps) {
    return (
        <div className={`max-w-[1400px] mx-auto px-4 pb-6 pt-4 ${className || ''}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Sidebar - Contextual filters and widgets */}
                {leftSidebar && (
                    <aside className="hidden lg:block lg:col-span-3 space-y-4">
                        <div className="sticky top-20 space-y-4">
                            {leftSidebar}
                        </div>
                    </aside>
                )}

                {/* Main Content - Center canvas */}
                <main className={`col-span-1 ${leftSidebar && rightSidebar ? 'lg:col-span-6' : leftSidebar || rightSidebar ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-4`}>
                    {children}
                </main>

                {/* Right Sidebar - Assist panels */}
                {rightSidebar && (
                    <aside className="hidden lg:block lg:col-span-3 space-y-4">
                        <div className="sticky top-20 space-y-4">
                            {rightSidebar}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    )
}
