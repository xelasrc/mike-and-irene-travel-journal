'use client'

import { MapPin } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

interface TravelMapProps {
  lat: number
  lng: number
  city: string
  country: string
  updatedAt: string
}

export default function TravelMap({ lat, lng, city, country, updatedAt }: TravelMapProps) {
  const pad = 0.08
  const bbox = `${lng - pad}%2C${lat - pad}%2C${lng + pad}%2C${lat + pad}`
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`

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
      <div className="h-52 sm:h-64">
        <iframe
          src={src}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          title="Mike & Irene's current location"
        />
      </div>
    </div>
  )
}
