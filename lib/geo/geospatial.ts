import type { RoutePoint } from "@/lib/activity/route"

export interface RouteBounds {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

export interface RouteMetadata {
  pointCount: number
  bounds: RouteBounds | null
  center: { lat: number; lng: number } | null
}

export function getRouteBounds(points: RoutePoint[]): RouteBounds | null {
  if (points.length === 0) return null

  let minLat = points[0].lat
  let maxLat = points[0].lat
  let minLng = points[0].lng
  let maxLng = points[0].lng

  for (const point of points) {
    minLat = Math.min(minLat, point.lat)
    maxLat = Math.max(maxLat, point.lat)
    minLng = Math.min(minLng, point.lng)
    maxLng = Math.max(maxLng, point.lng)
  }

  return { minLat, maxLat, minLng, maxLng }
}

export function buildRouteMetadata(points: RoutePoint[]): RouteMetadata {
  const bounds = getRouteBounds(points)
  if (!bounds) {
    return {
      pointCount: 0,
      bounds: null,
      center: null,
    }
  }

  return {
    pointCount: points.length,
    bounds,
    center: {
      lat: (bounds.minLat + bounds.maxLat) / 2,
      lng: (bounds.minLng + bounds.maxLng) / 2,
    },
  }
}
