import Link from 'next/link'
import Image from 'next/image'
import { MapPin, MessageCircle, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Post } from '@/lib/types'

interface PostCardProps {
  post: Post & { comment_count: number }
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white rounded-2xl border border-warm-border overflow-hidden shadow-sm active:scale-[0.99] transition-transform">
      {/* Cover image */}
      {post.cover_image_url && (
        <Link href={`/posts/${post.slug}`}>
          <div className="relative h-56 sm:h-64 overflow-hidden">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, 700px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
          </div>
        </Link>
      )}

      <div className="p-4 sm:p-6">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-warm-muted mb-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(post.created_at)}
          </span>
          {post.location && (
            <span className="flex items-center gap-1 text-warm-accent font-medium">
              <MapPin className="w-3 h-3" />
              {post.location}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/posts/${post.slug}`}>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-warm-text mb-2 leading-snug">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-warm-muted leading-relaxed text-sm line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-warm-border">
          <span className="text-xs text-warm-muted">
            by {post.profiles?.display_name ?? 'Mike'}
          </span>
          <Link
            href={`/posts/${post.slug}#comments`}
            className="flex items-center gap-1.5 text-sm text-warm-muted hover:text-warm-accent transition-colors py-1"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
