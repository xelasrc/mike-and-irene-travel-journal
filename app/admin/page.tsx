import Link from 'next/link'
import { PlusCircle, Edit, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import { formatDate } from '@/lib/utils'
import { togglePublished } from '@/app/actions/posts'
import DeletePostButton from '@/components/DeletePostButton'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, title, location, published, created_at, comments(count)')
    .order('created_at', { ascending: false })

  const postsWithCount = (posts ?? []).map(p => ({
    ...p,
    comment_count: (p.comments as unknown as { count: number }[])?.[0]?.count ?? 0,
  }))

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-warm-text">Admin dashboard</h1>
            <p className="text-warm-muted text-sm mt-1">{postsWithCount.length} total posts</p>
          </div>
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 bg-warm-accent text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-warm-accent-dark transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New post
          </Link>
        </div>

        {/* Posts table */}
        {postsWithCount.length === 0 ? (
          <div className="text-center py-16 text-warm-muted border border-dashed border-warm-border rounded-2xl">
            <p className="font-serif text-lg mb-2">No posts yet</p>
            <p className="text-sm mb-4">Ready to share your first day?</p>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-2 bg-warm-accent text-white px-4 py-2 rounded-full text-sm hover:bg-warm-accent-dark transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Write your first post
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {postsWithCount.map(post => (
              <div
                key={post.id}
                className="flex items-start gap-4 bg-white border border-warm-border rounded-xl p-4 hover:border-warm-accent/40 transition-colors"
              >
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${post.published ? 'bg-green-400' : 'bg-amber-400'}`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/posts/${post.slug}`}
                        className="font-semibold text-warm-text hover:text-warm-accent transition-colors leading-snug line-clamp-1"
                      >
                        {post.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-warm-muted">
                        <span>{formatDate(post.created_at)}</span>
                        {post.location && <span>· {post.location}</span>}
                        <span>· {post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}</span>
                        <span className={post.published ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                          · {post.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="p-1.5 text-warm-muted hover:text-warm-accent hover:bg-warm-highlight rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      <form action={async () => {
                        'use server'
                        await togglePublished(post.id, !post.published, post.slug)
                      }}>
                        <button
                          type="submit"
                          title={post.published ? 'Unpublish' : 'Publish'}
                          className="p-1.5 text-warm-muted hover:text-warm-accent hover:bg-warm-highlight rounded-lg transition-colors"
                        >
                          {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </form>

                      <DeletePostButton postId={post.id} title={post.title} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
