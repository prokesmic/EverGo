import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Image, MapPin, Trophy } from "lucide-react"

export default async function HomePage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="container py-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {/* Left Sidebar */}
                <div className="hidden md:block">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Your Rankings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🏃</span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">Running</span>
                                        <span className="text-xs text-muted-foreground">Prague</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Trophy className="h-4 w-4 text-ranking-gold" />
                                    <span className="font-bold">#32</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🚴</span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">Cycling</span>
                                        <span className="text-xs text-muted-foreground">Czech Rep.</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Trophy className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-bold">#423</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Feed */}
                <div className="md:col-span-2 space-y-6">
                    {/* Create Post */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src={session.user?.image || ""} />
                                    <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-4">
                                    <Input placeholder="What's new with your training?" className="bg-muted/50 border-none" />
                                    <div className="flex justify-between">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                                <Image className="mr-2 h-4 w-4" />
                                                Photo
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                                <MapPin className="mr-2 h-4 w-4" />
                                                Location
                                            </Button>
                                        </div>
                                        <Button size="sm" className="bg-brand-blue hover:bg-brand-blue-dark">Post</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feed Items (Placeholder) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <Avatar>
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-semibold">John Doe</span>
                                <span className="text-xs text-muted-foreground">2 hours ago • Running</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>Just finished a great morning run! The weather was perfect. ☀️</p>
                            <div className="rounded-lg bg-muted p-4">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Distance</div>
                                        <div className="text-xl font-bold">5.2 km</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Time</div>
                                        <div className="text-xl font-bold">28:45</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Pace</div>
                                        <div className="text-xl font-bold">5:31 /km</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="hidden md:block">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Suggested Friends</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>AS</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">Alice Smith</span>
                                        <span className="text-xs text-muted-foreground">Runner</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-brand-blue">Follow</Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>BJ</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">Bob Jones</span>
                                        <span className="text-xs text-muted-foreground">Cyclist</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-brand-blue">Follow</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
