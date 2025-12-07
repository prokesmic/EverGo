import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { LandingHero } from "@/components/landing/LandingHero"
import { LandingFeatures } from "@/components/landing/LandingFeatures"
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks"
import { LandingSocialProof } from "@/components/landing/LandingSocialProof"
import { LandingCTA } from "@/components/landing/LandingCTA"
import { LandingComparison } from "@/components/landing/LandingComparison"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/home")
  }

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
