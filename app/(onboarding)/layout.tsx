import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Get Started | EverGo",
  description: "Set up your EverGo profile and start tracking your fitness journey",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function OnboardingRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout overlays the main app navigation to provide a distraction-free onboarding experience
  // The fixed positioning with high z-index ensures it covers the main nav
  return (
    <div className="fixed inset-0 z-[100] overflow-auto">
      {children}
    </div>
  )
}
