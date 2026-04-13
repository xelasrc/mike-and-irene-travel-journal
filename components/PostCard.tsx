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
    <article className="bg-white rounded-2xl border border-[#e8d5be] overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {/* Cover image */}
      {post.cover_image_url && (
        <Link href={`/posts/${post.slug}`}>
          <div className="relative h-64 sm:h-72 overflow-hidden">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </Link>
      )}

      <div className="p-5 sm:p-6">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-[#8b6e5a] mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(post.created_at)}
          </span>
          {post.location && (
            <span className="flex items-center gap-1 text-[#c2621a] font-medium">
              <MapPin className="w-3.5 h-3.5" />
              {post.location}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/posts/${post.slug}`}>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#2d1b0e] mb-2 group-hover:text-[#c2621a] transition-colors leading-snug">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-[#8b6e5a] leading-relaxed text-sm sm:text-base line-clamp-3 mb-4">
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#e8d5be]">
          <span className="text-xs text-[#8b6e5a]">
            by {post.profiles?.display_name ?? 'Mike'}
          </span>
          <Link
            href={`/posts/${post.slug}#comments`}
            className="flex items-center gap-1.5 text-sm text-[#8b6e5a] hover:text-[#c2621a] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
