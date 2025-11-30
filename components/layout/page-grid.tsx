import { ReactNode } from "react"

interface PageGridProps {
    children: ReactNode
    leftSidebar?: ReactNode
    rightSidebar?: ReactNode
}

export function PageGrid({ children, leftSidebar, rightSidebar }: PageGridProps) {
    return (
        <div className="max-w-[1400px] mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Sidebar */}
                <div className="hidden md:block md:col-span-3 space-y-4">
                    {leftSidebar}
                </div>

                {/* Main Content */}
                <div className="col-span-1 md:col-span-6 space-y-4">
                    {children}
                </div>

                {/* Right Sidebar */}
                <div className="hidden md:block md:col-span-3 space-y-4">
                    {rightSidebar}
                </div>
            </div>
        </div>
    )
}
