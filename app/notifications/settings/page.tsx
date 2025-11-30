"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function NotificationSettingsPage() {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
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
        // Optimistic update
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
            // Revert on error
            fetchSettings()
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Notification Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Push Notifications</CardTitle>
                    <CardDescription>Manage your push notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Push Notifications</Label>
                            <p className="text-sm text-gray-500">Receive notifications on your device</p>
                        </div>
                        <Switch
                            checked={settings?.pushEnabled}
                            onCheckedChange={(checked: boolean) => updateSetting("pushEnabled", checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notification Types</CardTitle>
                    <CardDescription>Choose what you want to be notified about</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingRow
                        icon="❤️"
                        label="Social Activity"
                        description="Likes, comments, and new followers"
                        checked={settings?.socialEnabled}
                        onChange={(checked: boolean) => updateSetting("socialEnabled", checked)}
                    />
                    <SettingRow
                        icon="📈"
                        label="Rankings"
                        description="Rank changes and friend competition"
                        checked={settings?.rankingEnabled}
                        onChange={(checked: boolean) => updateSetting("rankingEnabled", checked)}
                    />
                    <SettingRow
                        icon="🔥"
                        label="Streaks"
                        description="Streak reminders and milestones"
                        checked={settings?.streakEnabled}
                        onChange={(checked: boolean) => updateSetting("streakEnabled", checked)}
                    />
                    <SettingRow
                        icon="🏆"
                        label="Challenges"
                        description="Challenge updates and completions"
                        checked={settings?.challengeEnabled}
                        onChange={(checked: boolean) => updateSetting("challengeEnabled", checked)}
                    />
                    <SettingRow
                        icon="👥"
                        label="Teams"
                        description="Team invites and activity"
                        checked={settings?.teamEnabled}
                        onChange={(checked: boolean) => updateSetting("teamEnabled", checked)}
                    />
                    <SettingRow
                        icon="📢"
                        label="Product Updates"
                        description="New features and special offers"
                        checked={settings?.marketingEnabled}
                        onChange={(checked: boolean) => updateSetting("marketingEnabled", checked)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Weekly Digest</CardTitle>
                    <CardDescription>Get a summary of your weekly activity</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Weekly Email Digest</Label>
                            <p className="text-sm text-gray-500">Receive a summary every Sunday</p>
                        </div>
                        <Switch
                            checked={settings?.weeklyDigestEnabled}
                            onCheckedChange={(checked: boolean) => updateSetting("weeklyDigestEnabled", checked)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function SettingRow({ icon, label, description, checked, onChange }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <div className="space-y-0.5">
                    <Label>{label}</Label>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    )
}
