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

// Static landing page - Deep Ocean theme
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]">
      <LandingHeader />
      <CommandPalette />
      <main className="flex-1">
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
