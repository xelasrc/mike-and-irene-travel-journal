'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ImagePlus, X, Loader2, Globe, EyeOff, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createPost, updatePost } from '@/app/actions/posts'
import { compressImage } from '@/lib/compressImage'
import type { Post, PostImage } from '@/lib/types'

interface PostEditorProps {
  post?: Post & { post_images: PostImage[] }
}

interface ImageEntry {
  id: string
  url: string
  file?: File
  uploading?: boolean
}

const CARD_RATIO = 672 / 224 // PostCard width:height ≈ 3

function BoundingBoxPicker({ src, value, onChange }: {
  src: string
  value: string
  onChange: (v: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pickerW, setPickerW] = useState(0)
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null)
  const dragging = useRef(false)
  const dragStart = useRef({ mouseX: 0, mouseY: 0, boxX: 0, boxY: 0 })
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const [xPct, yPct] = value.split(' ').map(s => parseFloat(s))

  function computeLayout() {
    if (!imgNatural || pickerW === 0) return null
    const imgRatio = imgNatural.w / imgNatural.h
    const pickerH = pickerW / imgRatio
    let boxW: number, boxH: number, maxX: number, maxY: number
    if (imgRatio >= CARD_RATIO) {
      // Image wider than card → horizontal crop
      boxH = pickerH
      boxW = pickerH * CARD_RATIO
      maxX = pickerW - boxW
      maxY = 0
    } else {
      // Image taller than card → vertical crop
      boxW = pickerW
      boxH = pickerW / CARD_RATIO
      maxX = 0
      maxY = pickerH - boxH
    }
    const boxX = (xPct / 100) * maxX
    const boxY = (yPct / 100) * maxY
    return { pickerH, boxW, boxH, boxX, boxY, maxX, maxY }
  }

  const layout = computeLayout()
  const layoutRef = useRef(layout)
  layoutRef.current = layout

  useEffect(() => {
    function onMove(e: MouseEvent | TouchEvent) {
      if (!dragging.current || !layoutRef.current) return
      e.preventDefault()
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY
      const { maxX, maxY } = layoutRef.current
      const newX = Math.min(maxX, Math.max(0, dragStart.current.boxX + clientX - dragStart.current.mouseX))
      const newY = Math.min(maxY, Math.max(0, dragStart.current.boxY + clientY - dragStart.current.mouseY))
      const xp = maxX > 0 ? Math.round((newX / maxX) * 100) : 50
      const yp = maxY > 0 ? Math.round((newY / maxY) * 100) : 50
      onChangeRef.current(`${xp}% ${yp}%`)
    }
    function onUp() { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  function startDrag(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!layoutRef.current) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    dragging.current = true
    dragStart.current = { mouseX: clientX, mouseY: clientY, boxX: layoutRef.current.boxX, boxY: layoutRef.current.boxY }
  }

  return (
    <div className="mb-3 rounded-xl border border-warm-border overflow-hidden">
      <div className="px-3 py-2 bg-warm-bg-2 border-b border-warm-border">
        <p className="text-xs font-medium text-warm-text">Cover framing</p>
        <p className="text-xs text-warm-muted">Drag the box to choose what shows in the card</p>
      </div>
      <div
        ref={containerRef}
        className="relative select-none overflow-hidden bg-black"
        style={{ height: layout?.pickerH ?? 180 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="w-full block"
          style={{ height: layout?.pickerH ?? 'auto', objectFit: 'fill' }}
          onLoad={e => {
            const img = e.currentTarget
            setImgNatural({ w: img.naturalWidth, h: img.naturalHeight })
            if (containerRef.current) setPickerW(containerRef.current.offsetWidth)
          }}
          draggable={false}
        />
        {layout && (
          <div
            className="absolute cursor-grab active:cursor-grabbing touch-none"
            style={{
              left: layout.boxX,
              top: layout.boxY,
              width: layout.boxW,
              height: layout.boxH,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
              border: '2px solid white',
              outline: '1px solid rgba(255,255,255,0.3)',
            }}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
          />
        )}
      </div>
    </div>
  )
}

export default function PostEditor({ post }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [location, setLocation] = useState(post?.location ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [published, setPublished] = useState(post?.published ?? false)
  const sortedExisting = post?.post_images
    ? [...post.post_images].sort((a, b) => a.display_order - b.display_order)
    : []
  const [images, setImages] = useState<ImageEntry[]>(
    sortedExisting.map(img => ({ id: img.id, url: img.image_url }))
  )
  const [coverIndex, setCoverIndex] = useState(() => {
    if (!post?.cover_image_url || sortedExisting.length === 0) return 0
    const idx = sortedExisting.findIndex(img => img.image_url === post.cover_image_url)
    return idx >= 0 ? idx : 0
  })
  const [coverPosition, setCoverPosition] = useState(post?.cover_position ?? '50% 50%')
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const newEntries: ImageEntry[] = Array.from(files).map(file => ({
      id: `pending-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
      uploading: false,
    }))
    setImages(prev => [...prev, ...newEntries])
  }

  function removeImage(id: string) {
    setImages(prev => {
      const idx = prev.findIndex(img => img.id === id)
      const next = prev.filter(img => img.id !== id)
      setCoverIndex(old => {
        if (idx < old) return old - 1
        if (idx === old) return 0
        return old
      })
      return next
    })
  }

  function moveImage(idx: number, dir: -1 | 1) {
    const newIdx = idx + dir
    setImages(prev => {
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      return next
    })
    setCoverIndex(old => {
      if (old === idx) return newIdx
      if (old === newIdx) return idx
      return old
    })
  }

  async function uploadPendingImages(): Promise<string[]> {
    const pending = images.filter(e => e.file)
    const urls: string[] = []
    let i = 0

    for (const entry of images) {
      if (!entry.file) {
        urls.push(entry.url)
        continue
      }

      i++
      setSubmitStatus(`Compressing photo ${i} of ${pending.length}…`)
      const compressed = await compressImage(entry.file)

      setSubmitStatus(`Uploading photo ${i} of ${pending.length}…`)
      const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
      const { error } = await supabase.storage
        .from('post-images')
        .upload(path, compressed, { contentType: 'image/jpeg', upsert: false })

      if (error) throw new Error(`Failed to upload image: ${error.message}`)

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(path)

      urls.push(publicUrl)
    }

    setSubmitStatus('Saving post…')
    return urls
  }

  async function handleSubmit(e: React.FormEvent, publishOverride?: boolean) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required.'); return }
    if (!content.trim()) { setError('Content is required.'); return }

    setSubmitting(true)
    setSubmitStatus('Starting…')
    setError(null)

    try {
      const uploaded = await uploadPendingImages()
      // Move selected cover to index 0 so actions treat it as cover
      const imageUrls = uploaded.length > 0
        ? [uploaded[coverIndex] ?? uploaded[0], ...uploaded.filter((_, i) => i !== coverIndex)]
        : uploaded
      const isPublished = publishOverride ?? published

      if (post) {
        await updatePost({
          postId: post.id,
          title: title.trim(),
          location: location.trim(),
          content: content.trim(),
          published: isPublished,
          imageUrls,
          existingSlug: post.slug,
          coverPosition,
        })
      } else {
        await createPost({
          title: title.trim(),
          location: location.trim(),
          content: content.trim(),
          published: isPublished,
          imageUrls,
          coverPosition,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-[#2d1b0e] mb-1.5">
          Post title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Arrived in Rome — what a city!"
          className="w-full rounded-xl border border-[#e8d5be] bg-[#fdf8f0] px-4 py-3 font-serif text-lg text-[#2d1b0e] placeholder-[#8b6e5a] focus:outline-none focus:ring-2 focus:ring-[#c2621a]/30 focus:border-[#c2621a] transition"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-[#2d1b0e] mb-1.5">
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Rome, Italy"
          className="w-full rounded-xl border border-[#e8d5be] bg-[#fdf8f0] px-4 py-3 text-[#2d1b0e] placeholder-[#8b6e5a] focus:outline-none focus:ring-2 focus:ring-[#c2621a]/30 focus:border-[#c2621a] transition"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-[#2d1b0e] mb-1.5">
          What happened today? <span className="text-red-400">*</span>
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write about your day — where you went, what you saw, how you felt…"
          rows={12}
          className="w-full rounded-xl border border-[#e8d5be] bg-[#fdf8f0] px-4 py-3 text-[#2d1b0e] placeholder-[#8b6e5a] focus:outline-none focus:ring-2 focus:ring-[#c2621a]/30 focus:border-[#c2621a] resize-y transition leading-relaxed"
        />
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-[#2d1b0e] mb-1.5">
          Photos
          <span className="text-[#8b6e5a] font-normal ml-1.5">— tap to set cover, arrows to reorder</span>
        </label>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {images.map((img, i) => {
              const isCover = i === coverIndex
              return (
                <div
                  key={img.id}
                  onClick={() => setCoverIndex(i)}
                  className={`relative aspect-square rounded-lg overflow-hidden bg-warm-bg-2 cursor-pointer ring-2 transition-all ${isCover ? 'ring-warm-accent' : 'ring-transparent hover:ring-warm-border'}`}
                >
                  <Image
                    src={img.url}
                    alt={`Photo ${i + 1}`}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                  {isCover ? (
                    <span className="absolute top-1 left-1 flex items-center gap-1 text-xs bg-warm-accent text-white px-1.5 py-0.5 rounded-full leading-none">
                      <Star className="w-2.5 h-2.5" /> Cover
                    </span>
                  ) : (
                    <span className="absolute top-1 left-1 text-xs bg-black/40 text-white px-1.5 py-0.5 rounded-full leading-none opacity-0 hover:opacity-100 transition-opacity">
                      Set cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); removeImage(img.id) }}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                    aria-label="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {/* Reorder arrows */}
                  <div className="absolute bottom-1 left-1 right-1 flex justify-between">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); moveImage(i, -1) }}
                      disabled={i === 0}
                      className="bg-black/60 text-white rounded-full p-0.5 disabled:opacity-20"
                      aria-label="Move left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); moveImage(i, 1) }}
                      disabled={i === images.length - 1}
                      className="bg-black/60 text-white rounded-full p-0.5 disabled:opacity-20"
                      aria-label="Move right"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Cover framing */}
        {images.length > 0 && (
          <BoundingBoxPicker
            src={images[coverIndex]?.url}
            value={coverPosition}
            onChange={setCoverPosition}
          />
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-warm-border text-warm-muted hover:border-warm-accent hover:text-warm-accent transition-colors w-full justify-center"
        >
          <ImagePlus className="w-5 h-5" />
          <span className="text-sm">Add photos</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-warm-border">
        <button
          type="button"
          onClick={e => { setPublished(false); handleSubmit(e, false) }}
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-warm-border text-warm-muted hover:bg-warm-bg-2 transition-colors disabled:opacity-50 text-sm"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
          Save as draft
        </button>
        <button
          type="button"
          onClick={e => { setPublished(true); handleSubmit(e, true) }}
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-warm-accent text-white hover:bg-warm-accent-dark transition-colors disabled:opacity-50 text-sm"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
          {submitting ? submitStatus : (post ? 'Save changes' : 'Publish post')}
        </button>
      </div>
    </form>
  )
}
