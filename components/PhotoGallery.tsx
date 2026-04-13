'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { PostImage } from '@/lib/types'

export default function PhotoGallery({ images }: { images: PostImage[] }) {
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const sorted = [...images].sort((a, b) => a.display_order - b.display_order)

  if (sorted.length === 0) return null

  function prev() { setCurrent(i => (i - 1 + sorted.length) % sorted.length) }
  function next() { setCurrent(i => (i + 1) % sorted.length) }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  return (
    <>
      {/* Carousel */}
      <div className="relative select-none">
        <div
          className="relative aspect-square sm:aspect-4/3 overflow-hidden sm:rounded-xl bg-warm-bg-2 cursor-pointer"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={sorted[current].image_url}
            alt={sorted[current].caption ?? `Photo ${current + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, 672px"
            className="object-cover"
            priority={current === 0}
          />

          {/* Counter pill */}
          {sorted.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
              {current + 1} / {sorted.length}
            </div>
          )}

          {/* Desktop arrows */}
          {sorted.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white items-center justify-center hover:bg-black/60 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white items-center justify-center hover:bg-black/60 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Caption overlay */}
          {sorted[current].caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent px-4 py-3">
              <p className="text-white text-sm leading-snug">{sorted[current].caption}</p>
            </div>
          )}
        </div>

        {/* Dots */}
        {sorted.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === current ? 'w-5 bg-warm-accent' : 'w-1.5 bg-warm-border'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {sorted.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="relative w-full h-full flex items-center justify-center px-14"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={sorted[current].image_url}
                alt={sorted[current].caption ?? `Photo ${current + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-sm">
            {current + 1} / {sorted.length}
          </div>
        </div>
      )}
    </>
  )
}
