'use client'

import dynamic from 'next/dynamic'

const TravelMap = dynamic(() => import('./TravelMap'), { ssr: false })

export default function TravelMapWrapper(props: {
  lat: number
  lng: number
  city: string
  country: string
  updatedAt: string
}) {
  return <TravelMap {...props} />
}
