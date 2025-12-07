"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-surface-secondary rounded-full w-fit">
            <WifiOff className="w-12 h-12 text-text-muted" />
          </div>
          <CardTitle className="text-2xl">You're Offline</CardTitle>
          <CardDescription className="text-base">
            It looks like you've lost your internet connection. Don't worry, you can still view some
            of your cached content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload()
              }
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <div className="text-center text-sm text-text-muted">
            <p className="mb-2">While offline, you can:</p>
            <ul className="list-disc list-inside text-left space-y-1">
              <li>View previously loaded pages</li>
              <li>Check your profile</li>
              <li>Browse cached activities</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
