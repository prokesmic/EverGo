"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Zap, Sparkles, Activity, Bike, Waves, Dribbble } from "lucide-react"

// Sport icons for the rotating animation
const sportIcons = [
  { icon: Activity, name: "Running" },
  { icon: Bike, name: "Cycling" },
  { icon: Waves, name: "Swimming" },
  { icon: Dribbble, name: "Golf" },
]

// Animated line graph component
function AnimatedGraph() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 2))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Generate a smooth wave-like path
  const generatePath = () => {
    const points = []
    for (let i = 0; i <= 100; i += 5) {
      const y = 50 + Math.sin((i / 100) * Math.PI * 3 + progress / 20) * 30
      points.push(`${i},${y}`)
    }
    return `M${points.join(" L")}`
  }

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      {/* Grid lines */}
      {[20, 40, 60, 80].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="100"
          y2={y}
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeDasharray="2 2"
        />
      ))}
      {/* Main animated line */}
      <path
        d={generatePath()}
        fill="none"
        stroke="url(#gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
      />
      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {/* Animated dot at the end */}
      <circle
        cx="100"
        cy={50 + Math.sin((100 / 100) * Math.PI * 3 + progress / 20) * 30}
        r="4"
        fill="#22d3ee"
        className="animate-pulse"
      />
    </svg>
  )
}

// Rotating sport icons component
function RotatingSportsIcons() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sportIcons.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center gap-4">
      {sportIcons.map((sport, index) => {
        const Icon = sport.icon
        const isActive = index === currentIndex
        return (
          <div
            key={sport.name}
            className={`transition-all duration-500 ${
              isActive
                ? "scale-125 opacity-100"
                : "scale-75 opacity-40"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                isActive
                  ? "bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Orbiting logos component
function OrbitingLogos() {
  const partners = [
    { name: "Garmin", color: "#007CC3" },
    { name: "Strava", color: "#FC4C02" },
    { name: "Apple", color: "#A2AAAD" },
  ]

  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Center EverGo logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-2xl font-bold text-slate-950 shadow-lg shadow-cyan-500/30">
          ⚡
        </div>
      </div>
      {/* Orbiting logos */}
      {partners.map((partner, index) => (
        <div
          key={partner.name}
          className="absolute w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-lg"
          style={{
            backgroundColor: partner.color,
            color: "white",
            top: "50%",
            left: "50%",
            transform: `rotate(${index * 120}deg) translateX(70px) rotate(-${index * 120}deg)`,
            animation: `orbit 8s linear infinite`,
            animationDelay: `${index * -2.67}s`,
          }}
        >
          {partner.name[0]}
        </div>
      ))}
      {/* Orbit path */}
      <div className="absolute inset-4 rounded-full border border-slate-700/50 border-dashed" />
    </div>
  )
}

export function LandingFeatures() {
  return (
    <section className="w-full py-20 md:py-28 bg-[#020617] overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-emerald-400 text-sm font-medium mb-4 border border-white/10">
            <Sparkles className="w-4 h-4" />
            <span>Powerful features</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-50 mb-4">
            Everything you need to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              level up your fitness
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            From casual fitness to competitive training, EverGo has you covered
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {/* Card 1: Analytics - Large, spans 2 rows */}
          <div className="md:row-span-2 backdrop-blur-md bg-slate-900/40 rounded-2xl p-6 border border-white/10 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-50">Smart Analytics</h3>
                <p className="text-xs text-slate-400">Real-time performance tracking</p>
              </div>
            </div>
            <div className="flex-1 relative min-h-[200px]">
              <AnimatedGraph />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-400">+24%</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">This month</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-cyan-400">142 km</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">5:12</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Avg pace</div>
              </div>
            </div>
          </div>

          {/* Card 2: 25+ Sports - Square */}
          <div className="backdrop-blur-md bg-slate-900/40 rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center">
            <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-4">
              25+
            </div>
            <h3 className="font-bold text-slate-50 mb-2">Sports Supported</h3>
            <div className="mt-4">
              <RotatingSportsIcons />
            </div>
          </div>

          {/* Card 3: Sync Everywhere - Square */}
          <div className="backdrop-blur-md bg-slate-900/40 rounded-2xl p-6 border border-white/10 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-50">Sync Everywhere</h3>
                <p className="text-xs text-slate-400">Auto-import from your devices</p>
              </div>
            </div>
            <div className="mt-4">
              <OrbitingLogos />
            </div>
          </div>

          {/* Card 4: Rankings - Horizontal span 2 */}
          <div className="md:col-span-2 backdrop-blur-md bg-slate-900/40 rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-50 mb-2">Real Rankings</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Compete at every level - from your local club to the global stage
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Club", "City", "Country", "Global"].map((level, i) => (
                    <span
                      key={level}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        i === 0
                          ? "bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950"
                          : "bg-slate-900/50 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                {[
                  { rank: 1, name: "Sarah K.", points: "2,847", color: "from-yellow-400 to-amber-500" },
                  { rank: 2, name: "Mike R.", points: "2,654", color: "from-slate-300 to-slate-400" },
                  { rank: 3, name: "You", points: "2,521", color: "from-amber-600 to-orange-600", highlight: true },
                ].map((user) => (
                  <div
                    key={user.rank}
                    className={`text-center p-3 rounded-xl ${
                      user.highlight
                        ? "backdrop-blur-md bg-cyan-500/10 border border-cyan-500/50"
                        : "backdrop-blur-md bg-slate-900/40 border border-white/10"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center mx-auto mb-2 text-white font-bold`}
                    >
                      {user.rank}
                    </div>
                    <div className={`text-sm font-medium ${user.highlight ? "text-emerald-400" : "text-white"}`}>
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-500">{user.points} pts</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for orbit animation */}
      <style jsx>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(70px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(70px) rotate(-360deg);
          }
        }
      `}</style>
    </section>
  )
}
