'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PostImage } from '@/lib/types'

interface PhotoGalleryProps {
  images: PostImage[]
}

export default function PhotoGallery({ images }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (images.length === 0) return null

  function prev() {
    setLightboxIndex(i => (i === null ? null : (i - 1 + images.length) % images.length))
  }

  function next() {
    setLightboxIndex(i => (i === null ? null : (i + 1) % images.length))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'Escape') setLightboxIndex(null)
  }

  const sorted = [...images].sort((a, b) => a.display_order - b.display_order)

  return (
    <>
      {/* Gallery grid */}
      <div className={`grid gap-2 ${
        sorted.length === 1 ? 'grid-cols-1' :
        sorted.length === 2 ? 'grid-cols-2' :
        sorted.length === 3 ? 'grid-cols-3' :
        'grid-cols-2 sm:grid-cols-3'
      }`}>
        {sorted.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setLightboxIndex(i)}
            className={`relative overflow-hidden rounded-lg bg-[#faf3e8] cursor-zoom-in group ${
              sorted.length === 1 ? 'aspect-[16/9]' : 'aspect-square'
            } ${sorted.length >= 4 && i === 0 ? 'col-span-2 row-span-2 aspect-square' : ''}`}
          >
            <Image
              src={img.image_url}
              alt={img.caption ?? `Photo ${i + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 300px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev */}
          {sorted.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-4 text-white/70 hover:text-white p-2 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center px-16"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={sorted[lightboxIndex].image_url}
                alt={sorted[lightboxIndex].caption ?? `Photo ${lightboxIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            {sorted[lightboxIndex].caption && (
              <p className="absolute bottom-2 left-0 right-0 text-center text-white/80 text-sm">
                {sorted[lightboxIndex].caption}
              </p>
            )}
          </div>

          {/* Next */}
          {sorted.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-4 text-white/70 hover:text-white p-2 z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm">
            {lightboxIndex + 1} / {sorted.length}
          </div>
        </div>
      )}
    </>
  )
}
