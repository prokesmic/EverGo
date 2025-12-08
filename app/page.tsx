import { LandingHero } from "@/components/landing/LandingHero"
import { LandingFeatures } from "@/components/landing/LandingFeatures"
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks"
import { LandingSocialProof } from "@/components/landing/LandingSocialProof"
import { LandingCTA } from "@/components/landing/LandingCTA"
import { LandingComparison } from "@/components/landing/LandingComparison"

// Static landing page - no database needed
export default function Home() {
  return (
    <div className="flex flex-col">
      <LandingHero />
      <LandingSocialProof />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingComparison />
      <LandingCTA />
    </div>
  )
}
