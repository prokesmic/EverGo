"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, Square, MapPin, Timer, TrendingUp, Activity as ActivityIcon } from "lucide-react"
import { toast } from "sonner"
import ActivityMap from "@/components/ui/map"

interface GPSPoint {
  lat: number
  lng: number
  timestamp: number
  altitude?: number
  accuracy?: number
}

interface GPSTrackerProps {
  onComplete: (data: {
    route: GPSPoint[]
    distance: number
    duration: number
    avgPace: number
  }) => void
}

export function GPSTracker({ onComplete }: GPSTrackerProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [route, setRoute] = useState<GPSPoint[]>([])
  const [distance, setDistance] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [autoPaused, setAutoPaused] = useState(false)

  const watchIdRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedAccumulatedMsRef = useRef<number>(0)
  const pauseStartedAtRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const pausedRef = useRef(false)
  const autoPausedRef = useRef(false)
  const lowSpeedSinceRef = useRef<number | null>(null)
  const nextCueKmRef = useRef(1)

  // Request location permission
  useEffect(() => {
    let isMounted = true
    const checkPermissions = async () => {
      if ("geolocation" in navigator) {
        const result = await navigator.permissions?.query({ name: "geolocation" })
        if (isMounted && result?.state === "denied" && error === null) {
          setError("Location permission denied. Please enable location services.")
        }
      } else if (error === null) {
        setError("Geolocation is not supported by your browser")
      }
    }
    checkPermissions()
    return () => { isMounted = false }
  }, [error])

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (point1: GPSPoint, point2: GPSPoint): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (point1.lat * Math.PI) / 180
    const φ2 = (point2.lat * Math.PI) / 180
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }

  // Start tracking
  const handleStart = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported")
      return
    }

    setIsTracking(true)
    setIsPaused(false)
    setAutoPaused(false)
    pausedRef.current = false
    autoPausedRef.current = false
    startTimeRef.current = Date.now()
    pausedAccumulatedMsRef.current = 0
    pauseStartedAtRef.current = null
    lowSpeedSinceRef.current = null
    nextCueKmRef.current = 1

    // Start duration timer
    intervalRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setDuration(Math.floor((Date.now() - startTimeRef.current - pausedAccumulatedMsRef.current) / 1000))
      }
    }, 1000)

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPoint: GPSPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy,
        }

        setRoute((prev) => {
          if (pausedRef.current) {
            return prev
          }

          // Calculate distance if we have a previous point
          if (prev.length > 0) {
            const lastPoint = prev[prev.length - 1]
            const newDistance = calculateDistance(lastPoint, newPoint)
            setDistance((d) => {
              const updatedDistance = d + newDistance
              const km = updatedDistance / 1000
              if (km >= nextCueKmRef.current) {
                emitDistanceCue(nextCueKmRef.current)
                nextCueKmRef.current += 1
              }
              return updatedDistance
            })

            // Calculate current speed (m/s to km/h)
            const timeDiff = (newPoint.timestamp - lastPoint.timestamp) / 1000
            if (timeDiff > 0) {
              const speed = (newDistance / timeDiff) * 3.6 // Convert to km/h
              setCurrentSpeed(speed)

              if (speed < 1.0) {
                if (!lowSpeedSinceRef.current) {
                  lowSpeedSinceRef.current = Date.now()
                } else if (Date.now() - lowSpeedSinceRef.current > 40_000 && !pausedRef.current) {
                  pauseTracking(true)
                  toast.info("Auto-pause enabled (inactivity detected)")
                }
              } else {
                lowSpeedSinceRef.current = null
                if (pausedRef.current && autoPausedRef.current) {
                  resumeTracking(true)
                  toast.success("Auto-resumed")
                }
              }
            }
          }

          return [...prev, newPoint]
        })

        setError(null)
      },
      (err) => {
        console.error("GPS error:", err)
        setError(`GPS Error: ${err.message}`)
        toast.error("GPS tracking error")
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )

    toast.success("GPS tracking started")
  }

  // Pause tracking
  const handlePause = () => {
    if (pausedRef.current) {
      resumeTracking(false)
      toast.success("Tracking resumed")
    } else {
      pauseTracking(false)
      toast.success("Tracking paused")
    }
  }

  // Stop tracking
  const handleStop = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setIsTracking(false)
    setIsPaused(false)
    pausedRef.current = false
    setAutoPaused(false)
    autoPausedRef.current = false

    // Calculate average pace (min/km)
    const avgPace = distance > 0 ? (duration / 60) / (distance / 1000) : 0

    onComplete({
      route,
      distance,
      duration,
      avgPace,
    })

    toast.success("Activity recorded!")
  }

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`
  }

  // Format pace as MM:SS /km
  const formatPace = (seconds: number) => {
    if (distance === 0) return "--:--"
    const paceSeconds = (duration / (distance / 1000))
    const m = Math.floor(paceSeconds / 60)
    const s = Math.floor(paceSeconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const mapPath = route.map((p) => [p.lat, p.lng] as [number, number])
  const center: [number, number] = route.length > 0
    ? [route[route.length - 1].lat, route[route.length - 1].lng]
    : [50.0755, 14.4378] // Default: Prague

  return (
    <div className="space-y-6">
      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[400px] w-full relative rounded-lg overflow-hidden">
            <ActivityMap
              center={center}
              zoom={15}
              path={mapPath}
            />
            {!isTracking && route.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                <div className="text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">Ready to track your activity</p>
                  <p className="text-sm opacity-75">Your route will appear here</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
              <ActivityIcon className="w-4 h-4" />
              Distance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">
              {(distance / 1000).toFixed(2)}
              <span className="text-sm font-normal text-text-muted ml-1">km</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">{formatTime(duration)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Avg Pace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">
              {formatPace(duration)}
              <span className="text-sm font-normal text-text-muted ml-1">/km</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
              <ActivityIcon className="w-4 h-4" />
              Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">
              {currentSpeed.toFixed(1)}
              <span className="text-sm font-normal text-text-muted ml-1">km/h</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error message */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex gap-4 justify-center">
        {!isTracking ? (
          <Button size="lg" onClick={handleStart} className="min-w-[200px]">
            <Play className="w-5 h-5 mr-2" />
            Start Tracking
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              variant={isPaused ? "default" : "secondary"}
              onClick={handlePause}
            >
              {isPaused ? (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              )}
            </Button>
            <Button size="lg" variant="destructive" onClick={handleStop}>
              <Square className="w-5 h-5 mr-2" />
              Finish
            </Button>
          </>
        )}
      </div>

      {/* Instructions */}
      <Card className="bg-surface-secondary">
        <CardContent className="pt-6">
          <p className="text-sm text-text-muted text-center">
            💡 Make sure location services are enabled on your device for accurate tracking.
            {route.length > 0 && ` Recorded ${route.length} GPS points.`}
            {autoPaused && " Auto-pause is currently active."}
          </p>
        </CardContent>
      </Card>
    </div>
  )

  function pauseTracking(triggeredByAutoPause: boolean) {
    if (pausedRef.current) return
    pausedRef.current = true
    setIsPaused(true)
    setAutoPaused(triggeredByAutoPause)
    autoPausedRef.current = triggeredByAutoPause
    pauseStartedAtRef.current = Date.now()
    if (navigator.vibrate) {
      navigator.vibrate([120, 60, 120])
    }
  }

  function resumeTracking(triggeredByAutoPause: boolean) {
    if (!pausedRef.current) return
    if (pauseStartedAtRef.current) {
      pausedAccumulatedMsRef.current += Date.now() - pauseStartedAtRef.current
    }
    pauseStartedAtRef.current = null
    pausedRef.current = false
    setIsPaused(false)
    if (triggeredByAutoPause) {
      setAutoPaused(false)
      autoPausedRef.current = false
    }
    if (navigator.vibrate) {
      navigator.vibrate(80)
    }
  }

  function emitDistanceCue(km: number) {
    const cueText = `${km} kilometer${km === 1 ? "" : "s"} completed`
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(cueText)
      utterance.rate = 1
      window.speechSynthesis.speak(utterance)
    }
    if (navigator.vibrate) {
      navigator.vibrate(70)
    }
  }
}
