"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Loader2, Bell, Heart, TrendingUp, Flame, Trophy, Users, Megaphone, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { GradientHeader, FrostedSection } from "@/components/ui/frosted-card"
import { cn } from "@/lib/utils"

const notificationTypes = [
    { key: "socialEnabled", icon: Heart, label: "Social Activity", description: "Likes, comments, and new followers", color: "text-pink-500" },
    { key: "rankingEnabled", icon: TrendingUp, label: "Rankings", description: "Rank changes and friend competition", color: "text-blue-500" },
    { key: "streakEnabled", icon: Flame, label: "Streaks", description: "Streak reminders and milestones", color: "text-orange-500" },
    { key: "challengeEnabled", icon: Trophy, label: "Challenges", description: "Challenge updates and completions", color: "text-amber-500" },
    { key: "teamEnabled", icon: Users, label: "Teams", description: "Team invites and activity", color: "text-emerald-500" },
    { key: "marketingEnabled", icon: Megaphone, label: "Product Updates", description: "New features and special offers", color: "text-purple-500" },
]

export default function NotificationSettingsPage() {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/notifications/settings")
            const data = await res.json()
            setSettings(data)
        } catch (error) {
            console.error("Failed to fetch settings", error)
        } finally {
            setLoading(false)
        }
    }

    const updateSetting = async (key: string, value: any) => {
        setSettings({ ...settings, [key]: value })

        try {
            await fetch("/api/notifications/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: value })
            })
        } catch (error) {
            console.error("Failed to update setting", error)
            toast({
                title: "Error",
                description: "Failed to save settings",
                variant: "destructive"
            })
            fetchSettings()
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container max-w-3xl py-8 px-4 md:px-6">
                <GradientHeader
                    icon={<Bell className="w-6 h-6" />}
                    title="Notifications"
                    description="Manage how EverGo keeps you in the loop"
                />

                <div className="space-y-6">
                    {/* Master Toggle */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Bell className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Push Notifications</h3>
                                    <p className="text-white/80 text-sm">Receive notifications on your device</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings?.pushEnabled}
                                onCheckedChange={(checked: boolean) => updateSetting("pushEnabled", checked)}
                                className="data-[state=checked]:bg-white data-[state=checked]:text-indigo-600"
                            />
                        </div>
                    </div>

                    {/* Notification Types */}
                    <FrostedSection
                        title="Notification Types"
                        description="Choose what you want to be notified about"
                        className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-xl !p-6"
                    >
                        <div className="space-y-1 mt-4">
                            {notificationTypes.map((type, index) => {
                                const Icon = type.icon
                                const isEnabled = settings?.[type.key]

                                return (
                                    <div
                                        key={type.key}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-xl transition-colors",
                                            isEnabled ? "bg-slate-50" : "bg-transparent",
                                            index !== notificationTypes.length - 1 && "border-b border-slate-100"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-2.5 rounded-xl transition-colors",
                                                isEnabled ? "bg-white shadow-sm" : "bg-slate-100"
                                            )}>
                                                <Icon className={cn("w-5 h-5", isEnabled ? type.color : "text-slate-400")} />
                                            </div>
                                            <div>
                                                <h4 className={cn(
                                                    "font-semibold transition-colors",
                                                    isEnabled ? "text-slate-900" : "text-slate-500"
                                                )}>
                                                    {type.label}
                                                </h4>
                                                <p className="text-sm text-slate-500">{type.description}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={isEnabled}
                                            onCheckedChange={(checked: boolean) => updateSetting(type.key, checked)}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </FrostedSection>

                    {/* Weekly Digest */}
                    <FrostedSection
                        title="Weekly Digest"
                        description="Get a summary of your weekly activity"
                        icon={<Mail className="w-4 h-4 text-cyan-500" />}
                        className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-xl !p-6"
                    >
                        <div className="flex items-center justify-between mt-4 p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">Weekly Email Digest</h4>
                                    <p className="text-sm text-slate-500">Receive a summary every Sunday</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings?.weeklyDigestEnabled}
                                onCheckedChange={(checked: boolean) => updateSetting("weeklyDigestEnabled", checked)}
                            />
                        </div>
                    </FrostedSection>
                </div>
            </div>
        </div>
    )
}
