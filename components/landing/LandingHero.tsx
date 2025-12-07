import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"

export function LandingHero() {
  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40 xl:py-48 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-brand-blue to-brand-green opacity-95" />

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="container relative px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Join 50,000+ athletes worldwide
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl/none">
              The #1 Multi-Sport
              <span className="block bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                Social Network
              </span>
            </h1>
            <p className="mx-auto max-w-[700px] text-xl text-white/90 md:text-2xl leading-relaxed">
              Track any sport. Compete with everyone. From your neighborhood to the world.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="bg-white text-brand-blue hover:bg-gray-100 text-lg px-8 py-6 h-auto shadow-xl hover:shadow-2xl transition-all"
            >
              <Link href="/register" className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
            >
              <Link href="#demo" className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-white/80">
            <div className="text-center">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm">Active Athletes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">25+</div>
              <div className="text-sm">Sports Supported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">150+</div>
              <div className="text-sm">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">1M+</div>
              <div className="text-sm">Activities Logged</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 fill-current text-white" viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 48h1440V0c-240 48-480 48-720 0S240 0 0 0v48z"></path>
        </svg>
      </div>
    </section>
  )
}
