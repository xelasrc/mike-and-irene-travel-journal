'use client'

import { Trash2 } from 'lucide-react'
import { deletePost } from '@/app/actions/posts'

export default function DeletePostButton({ postId, title }: { postId: string; title: string }) {
  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    await deletePost(postId)
  }

  return (
    <button
      onClick={handleDelete}
      title="Delete"
      className="p-1.5 text-warm-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
