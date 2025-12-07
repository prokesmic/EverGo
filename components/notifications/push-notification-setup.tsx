"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, BellOff, Check } from "lucide-react"
import { toast } from "sonner"

export function PushNotificationSetup() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    // Check if Push API is supported
    if ("Notification" in window && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)
      setPermission(Notification.permission)

      // Check current subscription status
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error("Error checking subscription:", error)
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const subscribeToPushNotifications = async () => {
    setIsLoading(true)

    try {
      // Request notification permission
      const permissionResult = await Notification.requestPermission()
      setPermission(permissionResult)

      if (permissionResult !== "granted") {
        toast.error("Notification permission denied")
        setIsLoading(false)
        return
      }

      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        registration = await navigator.serviceWorker.register("/sw.js")
      }

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready

      // Get VAPID public key from environment or server
      // For now, we'll use a placeholder. In production, get from server
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""

      if (!vapidPublicKey) {
        console.warn("VAPID public key not configured")
        toast.error("Push notifications not configured on server")
        setIsLoading(false)
        return
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      // Send subscription to backend
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      })

      if (!response.ok) throw new Error("Failed to save subscription")

      setIsSubscribed(true)
      toast.success("Push notifications enabled!")
    } catch (error) {
      console.error("Error subscribing to push notifications:", error)
      toast.error("Failed to enable push notifications")
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribeFromPushNotifications = async () => {
    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe
        await subscription.unsubscribe()

        // Remove subscription from backend
        await fetch("/api/notifications/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        setIsSubscribed(false)
        toast.success("Push notifications disabled")
      }
    } catch (error) {
      console.error("Error unsubscribing:", error)
      toast.error("Failed to disable push notifications")
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestNotification = async () => {
    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Test notification sent!")
      } else {
        toast.error("Failed to send test notification")
      }
    } catch (error) {
      console.error("Error sending test notification:", error)
      toast.error("Failed to send test notification")
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Push Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications. Try using a modern browser like Chrome, Firefox, or Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about streak reminders, new followers, likes, and comments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">Notifications Enabled</p>
                  <p className="text-sm text-text-muted">You'll receive push notifications</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <BellOff className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">Notifications Disabled</p>
                  <p className="text-sm text-text-muted">Enable to get updates</p>
                </div>
              </>
            )}
          </div>

          <Button
            onClick={isSubscribed ? unsubscribeFromPushNotifications : subscribeToPushNotifications}
            disabled={isLoading || permission === "denied"}
            variant={isSubscribed ? "outline" : "default"}
          >
            {isLoading ? "Loading..." : isSubscribed ? "Disable" : "Enable"}
          </Button>
        </div>

        {permission === "denied" && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              Notification permission denied. Please enable notifications in your browser settings.
            </p>
          </div>
        )}

        {isSubscribed && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-text-primary">Notification Settings</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg cursor-pointer hover:bg-surface-tertiary transition-colors">
                <input type="checkbox" defaultChecked className="rounded" />
                <div>
                  <p className="font-medium text-sm text-text-primary">Streak Reminders</p>
                  <p className="text-xs text-text-muted">Daily reminder if you haven't logged an activity</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg cursor-pointer hover:bg-surface-tertiary transition-colors">
                <input type="checkbox" defaultChecked className="rounded" />
                <div>
                  <p className="font-medium text-sm text-text-primary">Social Activity</p>
                  <p className="text-xs text-text-muted">Likes, comments, and new followers</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg cursor-pointer hover:bg-surface-tertiary transition-colors">
                <input type="checkbox" defaultChecked className="rounded" />
                <div>
                  <p className="font-medium text-sm text-text-primary">Challenge Updates</p>
                  <p className="text-xs text-text-muted">Progress updates and challenge completions</p>
                </div>
              </label>
            </div>

            <Button variant="outline" onClick={sendTestNotification} className="w-full">
              Send Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
