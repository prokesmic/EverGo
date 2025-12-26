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
    quote: "The rivalry system is genius. I've never been more motivated. Beating my rival by 2km last week felt better than any medal.",
    rating: 5,
    sport: "Running",
    highlight: "#8 → #3 in 2 months",
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Triathlete",
    location: "Madrid, Spain",
    avatar: "https://i.pravatar.cc/150?img=12",
    quote: "The local rankings made me obsessed. I went from #47 to #8 in my city in just 3 months. The competition is addictive.",
    rating: 5,
    sport: "Triathlon",
    highlight: "39 spots climbed",
  },
  {
    id: 3,
    name: "Emma Thompson",
    role: "CrossFit Athlete",
    location: "London, UK",
    avatar: "https://i.pravatar.cc/150?img=5",
    quote: "Squad battles changed everything. Our gym crushes other teams weekly. We've won 12 consecutive challenges.",
    rating: 5,
    sport: "CrossFit",
    highlight: "12 battle wins",
  },
  {
    id: 4,
    name: "David Park",
    role: "Cyclist",
    location: "Seoul, South Korea",
    avatar: "https://i.pravatar.cc/150?img=8",
    quote: "Sport Index finally gives me one number to chase. 847 and climbing. My wife says I'm obsessed. She's right.",
    rating: 5,
    sport: "Cycling",
    highlight: "Sport Index: 847",
  },
  {
    id: 5,
    name: "Ana Kowalski",
    role: "Ultra Runner",
    location: "Warsaw, Poland",
    avatar: "https://i.pravatar.cc/150?img=9",
    quote: "I've tried every tracking app. This is the first one that actually made me faster. The rivalries are brutal.",
    rating: 5,
    sport: "Running",
    highlight: "2 PRs this month",
  },
]

const compatibleBrands = [
  "Garmin",
  "Strava",
  "Apple",
  "Nike",
  "Adidas",
  "Polar",
  "Suunto",
  "Wahoo",
  "Zwift",
  "Peloton",
  "WHOOP",
  "Coros",
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
    <section className="w-full py-24 bg-slate-50 overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Compatible Gear Ticker */}
        <div className="mb-20">
          <h3 className="text-center text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">
            Compatible with your gear
          </h3>

          {/* Scrolling Ticker */}
          <div className="relative overflow-hidden">
            {/* Gradient Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10" />

            {/* Ticker Track */}
            <div className="flex animate-scroll">
              {/* First set of logos */}
              {compatibleBrands.map((brand, i) => (
                <div
                  key={`first-${i}`}
                  className="flex-shrink-0 mx-8 md:mx-12"
                >
                  <span className="text-2xl md:text-3xl font-bold text-slate-300 hover:text-slate-500 transition-colors cursor-default">
                    {brand}
                  </span>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {compatibleBrands.map((brand, i) => (
                <div
                  key={`second-${i}`}
                  className="flex-shrink-0 mx-8 md:mx-12"
                >
                  <span className="text-2xl md:text-3xl font-bold text-slate-300 hover:text-slate-500 transition-colors cursor-default">
                    {brand}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Athletes Who Dominate
          </h2>
          <p className="text-xl text-slate-500">
            Real competitors. Real results.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-5xl mx-auto">
          {/* Main Testimonial Card */}
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl p-8 md:p-12 overflow-hidden">
            {/* Quote Icon */}
            <Quote className="absolute top-6 right-6 w-16 h-16 text-orange-100" />

            {/* Testimonial Content */}
            <div className="relative grid md:grid-cols-3 gap-8 items-center">
              {/* Author Info - Left */}
              <div className="md:col-span-1">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg mb-4">
                    <AvatarImage src={testimonials[activeIndex].avatar} />
                    <AvatarFallback className="text-2xl bg-slate-900 text-white">
                      {testimonials[activeIndex].name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="font-bold text-xl text-slate-900">
                    {testimonials[activeIndex].name}
                  </div>
                  <div className="text-slate-500">{testimonials[activeIndex].role}</div>
                  <div className="text-sm text-slate-400">{testimonials[activeIndex].location}</div>

                  {/* Rating */}
                  <div className="flex gap-0.5 mt-4">
                    {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-orange-400 text-orange-400" />
                    ))}
                  </div>

                  {/* Highlight Badge */}
                  <div className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-bold">
                    {testimonials[activeIndex].highlight}
                  </div>
                </div>
              </div>

              {/* Quote - Right */}
              <div className="md:col-span-2">
                <blockquote className="text-xl md:text-2xl text-slate-700 leading-relaxed font-medium">
                  &ldquo;{testimonials[activeIndex].quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-2">
                  <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-bold">
                    {testimonials[activeIndex].sport}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-12 h-12 bg-white shadow-lg rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-orange-500 hover:border-orange-200 transition-all"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-12 h-12 bg-white shadow-lg rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-orange-500 hover:border-orange-200 transition-all"
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
                    ? "w-8 bg-orange-500"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: "4.9", label: "App Store", sublabel: "12K+ reviews" },
            { value: "98%", label: "Win Rate", sublabel: "user satisfaction" },
            { value: "50K+", label: "Athletes", sublabel: "active this month" },
            { value: "2.4M", label: "Battles", sublabel: "completed" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">
                {stat.value}
              </div>
              <div className="font-bold text-slate-600">{stat.label}</div>
              <div className="text-xs text-slate-400">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation for Ticker */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
