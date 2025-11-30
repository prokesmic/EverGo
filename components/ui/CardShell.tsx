import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CardShellProps {
    title: string
    icon?: ReactNode
    action?: ReactNode
    children: ReactNode
    className?: string
}

export function CardShell({ title, icon, action, children, className }: CardShellProps) {
    return (
        <div className={cn(
            "bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
            className
        )}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-900">
                    {icon && <span className="text-brand-blue">{icon}</span>}
                    <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                </div>
                {action && (
                    <div className="text-sm text-brand-blue font-medium hover:underline cursor-pointer">
                        {action}
                    </div>
                )}
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    )
}
