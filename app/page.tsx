import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/home")
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-brand-blue text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                The Global Network for Sports
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                EverGo combines social networking with sports performance tracking. Compete in real-time rankings locally and globally.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-full shadow-lg">
                <span className="text-4xl">🏆</span>
              </div>
              <h2 className="text-xl font-bold">Real-time Rankings</h2>
              <p className="text-muted-foreground">
                See how you compare to athletes in your city, country, and worldwide across multiple sports.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-full shadow-lg">
                <span className="text-4xl">🏃</span>
              </div>
              <h2 className="text-xl font-bold">Multi-Sport Tracking</h2>
              <p className="text-muted-foreground">
                Track everything from Running and Cycling to Golf and Tennis in one unified profile.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-full shadow-lg">
                <span className="text-4xl">🤝</span>
              </div>
              <h2 className="text-xl font-bold">Social Community</h2>
              <p className="text-muted-foreground">
                Connect with friends, join teams, share achievements, and motivate each other.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
