'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ImagePlus, X, Loader2, Globe, EyeOff, GripVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createPost, updatePost } from '@/app/actions/posts'
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

export default function PostEditor({ post }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [location, setLocation] = useState(post?.location ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [published, setPublished] = useState(post?.published ?? false)
  const [images, setImages] = useState<ImageEntry[]>(
    post?.post_images
      ? [...post.post_images]
          .sort((a, b) => a.display_order - b.display_order)
          .map(img => ({ id: img.id, url: img.image_url }))
      : []
  )
  const [submitting, setSubmitting] = useState(false)
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
    setImages(prev => prev.filter(img => img.id !== id))
  }

  async function uploadPendingImages(): Promise<string[]> {
    const urls: string[] = []
    for (const entry of images) {
      if (!entry.file) {
        // Already uploaded
        urls.push(entry.url)
        continue
      }
      const ext = entry.file.name.split('.').pop()
      const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('post-images')
        .upload(path, entry.file, { upsert: false })

      if (error) throw new Error(`Failed to upload image: ${error.message}`)

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(path)

      urls.push(publicUrl)
    }
    return urls
  }

  async function handleSubmit(e: React.FormEvent, publishOverride?: boolean) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required.'); return }
    if (!content.trim()) { setError('Content is required.'); return }

    setSubmitting(true)
    setError(null)

    try {
      const imageUrls = await uploadPendingImages()
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
        })
      } else {
        await createPost({
          title: title.trim(),
          location: location.trim(),
          content: content.trim(),
          published: isPublished,
          imageUrls,
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
          <span className="text-[#8b6e5a] font-normal ml-1.5">— first photo becomes the cover</span>
        </label>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {images.map((img, i) => (
              <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-[#faf3e8] group">
                <Image
                  src={img.url}
                  alt={`Photo ${i + 1}`}
                  fill
                  sizes="150px"
                  className="object-cover"
                />
                {i === 0 && (
                  <span className="absolute top-1 left-1 text-xs bg-[#c2621a] text-white px-1.5 py-0.5 rounded-full leading-none">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#e8d5be] text-[#8b6e5a] hover:border-[#c2621a] hover:text-[#c2621a] transition-colors w-full justify-center"
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
      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-[#e8d5be]">
        <button
          type="button"
          onClick={e => { setPublished(false); handleSubmit(e, false) }}
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#e8d5be] text-[#8b6e5a] hover:bg-[#faf3e8] transition-colors disabled:opacity-50 text-sm"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
          Save as draft
        </button>
        <button
          type="button"
          onClick={e => { setPublished(true); handleSubmit(e, true) }}
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#c2621a] text-white hover:bg-[#9a4e15] transition-colors disabled:opacity-50 text-sm"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
          {post?.published ? 'Save & publish' : 'Publish post'}
        </button>
      </div>
    </form>
  )
}
