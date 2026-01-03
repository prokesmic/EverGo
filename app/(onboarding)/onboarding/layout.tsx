import Link from "next/link"
import { Zap } from "lucide-react"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-blue-600 to-emerald-500">
      {/* Logo-only header (no app nav) */}
      <header className="sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition-all hover:bg-white/30"
          >
            <Zap className="h-5 w-5" />
            <span>EverGo</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium">
              AURORA
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl justify-center px-4 pb-16 pt-6">
        {children}
      </main>

      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>
    </div>
  )
}
