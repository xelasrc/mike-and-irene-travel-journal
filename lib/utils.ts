import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import type { Comment, CommentWithReplies } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return format(date, 'MMMM d, yyyy')
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const distance = formatDistanceToNow(date, { addSuffix: true })
  // Use relative for recent, absolute for older
  const daysDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  if (daysDiff < 7) return distance
  return format(date, 'MMM d, yyyy')
}

export function generateSlug(title: string): string {
  const date = new Date().toISOString().split('T')[0]
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
  return `${base}-${date}`
}

export function buildCommentTree(comments: Comment[]): CommentWithReplies[] {
  const map = new Map<string, CommentWithReplies>()
  const roots: CommentWithReplies[] = []

  comments.forEach(c => map.set(c.id, { ...c, replies: [] }))

  comments.forEach(c => {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies.push(map.get(c.id)!)
    } else {
      roots.push(map.get(c.id)!)
    }
  })

  return roots
}

export function generateExcerpt(content: string, maxLength = 200): string {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength).replace(/\s\S*$/, '') + '…'
}
