import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingHero } from "@/components/landing/LandingHero"
import { LandingFeatures } from "@/components/landing/LandingFeatures"
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks"
import { LandingSocialProof } from "@/components/landing/LandingSocialProof"
import { LandingCTA } from "@/components/landing/LandingCTA"
import { LandingComparison } from "@/components/landing/LandingComparison"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { LandingUpcoming } from "@/components/landing/LandingUpcoming"
import { CommandPalette } from "@/components/landing/CommandPalette"

// Static landing page - Platinum Air theme (Light)
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-cyan-200 overflow-x-hidden relative">
      {/* Background Gradient Mesh - Subtle & Airy */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-cyan-100/50 rounded-full blur-[120px] mix-blend-multiply" />
      </div>

      <LandingHeader />
      <CommandPalette />
      <main className="flex-1 relative z-10">
        <LandingHero />
        <section id="features">
          <LandingFeatures />
        </section>
        <section id="how-it-works">
          <LandingHowItWorks />
        </section>
        <section id="comparison">
          <LandingComparison />
        </section>
        <section id="testimonials">
          <LandingSocialProof />
        </section>
        <LandingUpcoming />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
