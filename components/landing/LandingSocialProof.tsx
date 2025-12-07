import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marathon Runner",
    location: "San Francisco, CA",
    avatar: "https://i.pravatar.cc/150?img=1",
    quote: "Finally, a platform that understands multi-sport athletes. I can track my running, swimming, and cycling all in one place!",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Triathlete",
    location: "Madrid, Spain",
    avatar: "https://i.pravatar.cc/150?img=12",
    quote: "The local rankings motivated me to push harder. I went from #47 to #8 in my city in just 3 months!",
    rating: 5,
  },
  {
    name: "Emma Thompson",
    role: "Fitness Enthusiast",
    location: "London, UK",
    avatar: "https://i.pravatar.cc/150?img=5",
    quote: "Love the partner finder feature! I've met amazing workout buddies through EverGo.",
    rating: 5,
  },
]

export function LandingSocialProof() {
  return (
    <section className="w-full py-16 md:py-24 bg-gray-50">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by athletes worldwide
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of athletes who are achieving their goals with EverGo
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.avatar} />
                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-xs text-gray-500">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-blue mb-2">4.9★</div>
            <div className="text-sm text-gray-600">App Store Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-blue mb-2">98%</div>
            <div className="text-sm text-gray-600">User Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-blue mb-2">24/7</div>
            <div className="text-sm text-gray-600">Support Available</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-blue mb-2">Free</div>
            <div className="text-sm text-gray-600">Forever Plan</div>
          </div>
        </div>
      </div>
    </section>
  )
}
