"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Marathon Runner",
    location: "San Francisco, CA",
    avatar: "https://i.pravatar.cc/150?img=1",
    quote: "Finally, a platform that understands multi-sport athletes. I can track my running, swimming, and cycling all in one place. The rankings keep me motivated every single day!",
    rating: 5,
    sport: "Running",
    highlight: "Multi-sport tracking",
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Triathlete",
    location: "Madrid, Spain",
    avatar: "https://i.pravatar.cc/150?img=12",
    quote: "The local rankings motivated me to push harder. I went from #47 to #8 in my city in just 3 months! The competition is real and keeps me accountable.",
    rating: 5,
    sport: "Triathlon",
    highlight: "Ranked up 39 spots",
  },
  {
    id: 3,
    name: "Emma Thompson",
    role: "Fitness Enthusiast",
    location: "London, UK",
    avatar: "https://i.pravatar.cc/150?img=5",
    quote: "Love the partner finder feature! I've met amazing workout buddies through EverGo. We train together twice a week now and it's completely changed my routine.",
    rating: 5,
    sport: "Gym & Running",
    highlight: "Found 3 training partners",
  },
  {
    id: 4,
    name: "David Park",
    role: "Weekend Cyclist",
    location: "Seoul, South Korea",
    avatar: "https://i.pravatar.cc/150?img=8",
    quote: "As a casual cyclist, I never thought I'd care about rankings. But seeing myself climb the local leaderboard has made cycling so much more fun!",
    rating: 5,
    sport: "Cycling",
    highlight: "2000km logged this year",
  },
  {
    id: 5,
    name: "Ana Kowalski",
    role: "CrossFit Athlete",
    location: "Warsaw, Poland",
    avatar: "https://i.pravatar.cc/150?img=9",
    quote: "The team challenges are incredible. My gym uses EverGo for our monthly competitions and it's brought our community so much closer together.",
    rating: 5,
    sport: "CrossFit",
    highlight: "Team challenge winner",
  },
]

const stats = [
  { value: "4.9", label: "App Store Rating", sublabel: "12K+ reviews" },
  { value: "98%", label: "User Satisfaction", sublabel: "based on surveys" },
  { value: "50K+", label: "Active Athletes", sublabel: "this month" },
  { value: "Free", label: "Forever Plan", sublabel: "full features" },
]

export function LandingSocialProof() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const goToPrev = () => {
    setIsAutoPlaying(false)
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setActiveIndex(index)
  }

  return (
    <section className="w-full py-20 md:py-28 bg-white overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-white text-sm font-medium mb-4 border border-slate-200">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span>Loved by athletes worldwide</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Real athletes, real results
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Join thousands of athletes who are achieving their goals with EverGo
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-5xl mx-auto">
          {/* Main Testimonial Card */}
          <div className="relative bg-white shadow-sm rounded-3xl border border-slate-200 p-8 md:p-12 overflow-hidden">
            {/* Quote Icon */}
            <Quote className="absolute top-6 right-6 w-16 h-16 text-slate-700/50" />

            {/* Testimonial Content */}
            <div className="relative grid md:grid-cols-3 gap-8 items-center">
              {/* Author Info - Left */}
              <div className="md:col-span-1">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 border-4 border-slate-800 shadow-lg mb-4">
                    <AvatarImage src={testimonials[activeIndex].avatar} />
                    <AvatarFallback className="text-2xl bg-slate-700 text-white">
                      {testimonials[activeIndex].name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="font-bold text-xl text-white">
                    {testimonials[activeIndex].name}
                  </div>
                  <div className="text-slate-500">{testimonials[activeIndex].role}</div>
                  <div className="text-sm text-slate-9000">{testimonials[activeIndex].location}</div>

                  {/* Rating */}
                  <div className="flex gap-0.5 mt-4">
                    {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Highlight Badge */}
                  <div className="mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30">
                    {testimonials[activeIndex].highlight}
                  </div>
                </div>
              </div>

              {/* Quote - Right */}
              <div className="md:col-span-2">
                <blockquote className="text-xl md:text-2xl text-slate-200 leading-relaxed font-medium">
                  &ldquo;{testimonials[activeIndex].quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-2">
                  <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">
                    {testimonials[activeIndex].sport}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-12 h-12 bg-white shadow-sm rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/20 transition-all"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-12 h-12 bg-white shadow-sm rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/20 transition-all"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === activeIndex
                    ? "w-8 bg-gradient-to-r from-emerald-400 to-cyan-500"
                    : "w-2 bg-slate-600 hover:bg-slate-500"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white shadow-sm rounded-2xl border border-slate-200 hover:border-white/20 transition-colors"
            >
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-1">
                {stat.value}
              </div>
              <div className="font-medium text-slate-900">{stat.label}</div>
              <div className="text-xs text-slate-9000">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
