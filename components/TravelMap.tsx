'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { MapPin } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icons broken by webpack
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface TravelMapProps {
  lat: number
  lng: number
  city: string
  country: string
  updatedAt: string
}

export default function TravelMap({ lat, lng, city, country, updatedAt }: TravelMapProps) {
  useEffect(() => {
    // Ensure Leaflet uses the correct icon on mount
    L.Marker.prototype.options.icon = icon
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-warm-border overflow-hidden shadow-sm mb-6">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-warm-border">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
        <MapPin className="w-3.5 h-3.5 text-warm-accent shrink-0" />
        <span className="text-sm text-warm-text">
          Mike & Irene are in{' '}
          <span className="font-semibold text-warm-accent">{city}, {country}</span>
        </span>
        <span className="ml-auto text-xs text-warm-muted whitespace-nowrap">
          {formatRelativeDate(updatedAt)}
        </span>
      </div>
      <MapContainer
        center={[lat, lng]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: 220, width: '100%' }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>'
        />
        <Marker position={[lat, lng]} icon={icon}>
          <Popup>{city}, {country}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
