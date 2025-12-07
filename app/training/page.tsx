"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Calendar,
  Dumbbell,
  Target,
  Trophy,
  Filter,
  Search,
  Loader2,
  Play,
  ChevronRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrainingPlanCard } from "@/components/training/training-plan-card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { toast } from "sonner"

interface TrainingPlan {
  id: string
  name: string
  description: string
  duration: number
  level: string
  imageUrl?: string
  tags: string
  sport?: { id: string; name: string; icon: string }
  totalWorkouts: number
  enrolledCount: number
}

interface UserPlan {
  id: string
  planId: string
  startDate: string
  currentWeek: number
  status: string
  progressPercentage: number
  plan: TrainingPlan
  sport?: { name: string; icon: string }
  currentWeekCompleted: number
  currentWeekTotal: number
}

export default function TrainingPlansPage() {
  const { data: session } = useSession()
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [userPlans, setUserPlans] = useState<UserPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [sports, setSports] = useState<any[]>([])
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch all available plans
        const plansRes = await fetch("/api/training-plans")
        const plansData = await plansRes.json()
        setPlans(plansData.plans || [])

        // Fetch user's enrolled plans if logged in
        if (session?.user) {
          const userPlansRes = await fetch("/api/training-plans/my")
          const userPlansData = await userPlansRes.json()
          setUserPlans(userPlansData.userPlans || [])
        }

        // Fetch sports for filter
        const sportsRes = await fetch("/api/sports")
        const sportsData = await sportsRes.json()
        setSports(sportsData.sports || [])
      } catch (error) {
        console.error("Error fetching training plans:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session])

  const handleEnroll = async (planId: string) => {
    if (!session?.user) {
      toast.error("Please sign in to enroll in training plans")
      return
    }

    setEnrollingId(planId)
    try {
      const res = await fetch(`/api/training-plans/${planId}/follow`, {
        method: "POST"
      })
      const data = await res.json()

      if (data.userPlan) {
        toast.success("Successfully enrolled in training plan!")
        // Refresh user plans
        const userPlansRes = await fetch("/api/training-plans/my")
        const userPlansData = await userPlansRes.json()
        setUserPlans(userPlansData.userPlans || [])
      } else if (data.error) {
        toast.error(data.error)
      }
    } catch (error) {
      console.error("Error enrolling:", error)
      toast.error("Failed to enroll in training plan")
    } finally {
      setEnrollingId(null)
    }
  }

  const filteredPlans = plans.filter(plan => {
    if (selectedSport !== "all" && plan.sport?.id !== selectedSport) return false
    if (selectedLevel !== "all" && plan.level !== selectedLevel) return false
    if (searchQuery && !plan.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const enrolledPlanIds = new Set(userPlans.map(up => up.planId))
  const activePlans = userPlans.filter(up => up.status === "ACTIVE")
  const completedPlans = userPlans.filter(up => up.status === "COMPLETED")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Calendar className="w-8 h-8 text-brand-primary" />
            Training Plans
          </h1>
          <p className="text-text-secondary mt-2">
            Follow structured training programs to reach your goals
          </p>
        </div>

        <Tabs defaultValue={activePlans.length > 0 ? "my-plans" : "browse"} className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="my-plans" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              My Plans
              {activePlans.length > 0 && (
                <Badge className="bg-brand-primary text-white ml-1">{activePlans.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Browse Plans
            </TabsTrigger>
          </TabsList>

          {/* My Plans Tab */}
          <TabsContent value="my-plans" className="space-y-6">
            {/* Active Plans */}
            {activePlans.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary">Active Plans</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activePlans.map((userPlan) => (
                    <Card key={userPlan.id} className="overflow-hidden hover:shadow-lg transition-all">
                      <div className="h-32 bg-gradient-to-r from-brand-blue to-blue-600 relative">
                        {userPlan.plan.imageUrl && (
                          <img
                            src={userPlan.plan.imageUrl}
                            alt={userPlan.plan.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-3 right-3 text-3xl">
                          {userPlan.sport?.icon || "🏃"}
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-green-500 text-white">
                            Week {userPlan.currentWeek}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-4">
                        <div>
                          <h3 className="font-bold text-text-primary">{userPlan.plan.name}</h3>
                          <p className="text-sm text-text-muted">
                            {userPlan.currentWeekCompleted}/{userPlan.currentWeekTotal} workouts this week
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Overall Progress</span>
                            <span className="font-medium">{userPlan.progressPercentage}%</span>
                          </div>
                          <Progress value={userPlan.progressPercentage} className="h-2" />
                        </div>
                        <Link href={`/training/${userPlan.planId}`}>
                          <Button className="w-full bg-brand-primary hover:bg-brand-primary-dark">
                            <Play className="w-4 h-4 mr-2" />
                            Continue Training
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Plans */}
            {completedPlans.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Completed Plans
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {completedPlans.map((userPlan) => (
                    <Card key={userPlan.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{userPlan.sport?.icon || "🏆"}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-text-primary truncate">
                            {userPlan.plan.name}
                          </h4>
                          <p className="text-xs text-green-600">Completed!</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {activePlans.length === 0 && completedPlans.length === 0 && (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No training plans yet
                </h3>
                <p className="text-text-secondary mb-4">
                  Browse our training plans and start your fitness journey today!
                </p>
                <Button
                  onClick={() => {
                    const tabsList = document.querySelector('[data-state="active"]')
                    // Programmatically switch tabs - this is a simple approach
                  }}
                  className="bg-brand-primary hover:bg-brand-primary-dark"
                >
                  Browse Plans
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Browse Plans Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <Input
                      placeholder="Search plans..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.icon} {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Plans Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlans.map((plan) => (
                <TrainingPlanCard
                  key={plan.id}
                  plan={plan}
                  isEnrolled={enrolledPlanIds.has(plan.id)}
                  progress={userPlans.find(up => up.planId === plan.id)?.progressPercentage}
                  onEnroll={() => handleEnroll(plan.id)}
                  isEnrolling={enrollingId === plan.id}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredPlans.length === 0 && (
              <Card className="p-12 text-center">
                <Dumbbell className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No plans found
                </h3>
                <p className="text-text-secondary">
                  Try adjusting your filters or check back later for new plans.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
