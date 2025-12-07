"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

interface MapProps {
    center?: [number, number]
    zoom?: number
    path?: [number, number][]
    markers?: Array<{ position: [number, number], title: string }>
    className?: string
}

// Create a wrapper component that loads leaflet CSS
function MapInner({ center = [51.505, -0.09], zoom = 13, path, markers, className }: MapProps) {
    const [LeafletComponents, setLeafletComponents] = useState<{
        MapContainer: any
        TileLayer: any
        Polyline: any
        Marker: any
        Popup: any
    } | null>(null)

    useEffect(() => {
        // Dynamically import all react-leaflet components
        Promise.all([
            import("react-leaflet"),
            // @ts-ignore - CSS import for side effects
            import("leaflet/dist/leaflet.css")
        ]).then(([reactLeaflet]) => {
            setLeafletComponents({
                MapContainer: reactLeaflet.MapContainer,
                TileLayer: reactLeaflet.TileLayer,
                Polyline: reactLeaflet.Polyline,
                Marker: reactLeaflet.Marker,
                Popup: reactLeaflet.Popup
            })
        })
    }, [])

    if (!LeafletComponents) {
        return <div className={`bg-gray-100 animate-pulse ${className}`} style={{ height: "100%", width: "100%" }} />
    }

    const { MapContainer, TileLayer, Polyline, Marker, Popup } = LeafletComponents

    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className={className} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {path && <Polyline positions={path} color="blue" />}
            {markers && markers.map((marker: { position: [number, number], title: string }, idx: number) => (
                <Marker key={idx} position={marker.position}>
                    <Popup>{marker.title}</Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}

// Export with dynamic loading and SSR disabled
export default dynamic(() => Promise.resolve(MapInner), { ssr: false })
