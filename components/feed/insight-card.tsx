import { Lightbulb, TrendingUp, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface InsightCardProps {
    type: "advice" | "trend"
    text: string
    actionText?: string
    actionUrl?: string
    className?: string
}

export function InsightCard({ type, text, actionText, actionUrl, className }: InsightCardProps) {
    return (
        <div className={cn(
            "bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-start gap-4 shadow-sm",
            className
        )}>
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                type === "advice" ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"
            )}>
                {type === "advice" ? <Lightbulb className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
            </div>

            <div className="flex-1 pt-1">
                <p className="text-sm text-gray-800 font-medium leading-relaxed mb-2">
                    {text}
                </p>
                {actionText && (
                    <button className="text-xs font-bold text-brand-blue hover:underline flex items-center">
                        {actionText} <ChevronRight className="h-3 w-3 ml-1" />
                    </button>
                )}
            </div>
        </div>
    )
}
