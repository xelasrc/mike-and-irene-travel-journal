'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PostImage } from '@/lib/types'

export default function PhotoGallery({ images }: { images: PostImage[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const sorted = [...images].sort((a, b) => a.display_order - b.display_order)

  if (sorted.length === 0) return null

  function prev() { setLightboxIndex(i => i === null ? null : (i - 1 + sorted.length) % sorted.length) }
  function next() { setLightboxIndex(i => i === null ? null : (i + 1) % sorted.length) }

  return (
    <>
      {/* Stacked photos at natural aspect ratio */}
      <div className="flex flex-col gap-1">
        {sorted.map((img, i) => (
          <div key={img.id}>
            <button
              onClick={() => setLightboxIndex(i)}
              className="w-full block cursor-zoom-in"
            >
              {/* width=0 height=0 + sizes + style is the Next.js way to get natural aspect ratio */}
              <Image
                src={img.image_url}
                alt={img.caption ?? `Photo ${i + 1}`}
                width={0}
                height={0}
                sizes="(max-width: 640px) 100vw, 672px"
                style={{ width: '100%', height: 'auto' }}
              />
            </button>
            {img.caption && (
              <p className="text-xs text-warm-muted text-center px-4 py-2 italic">
                {img.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
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
            <Image
              src={sorted[lightboxIndex].image_url}
              alt={sorted[lightboxIndex].caption ?? `Photo ${lightboxIndex + 1}`}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '90vh' }}
            />
          </div>

          <div className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-sm">
            {lightboxIndex + 1} / {sorted.length}
            {sorted[lightboxIndex].caption && (
              <p className="text-white/70 mt-1">{sorted[lightboxIndex].caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
