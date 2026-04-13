import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import { MapPin } from 'lucide-react'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id, slug, title, excerpt, location, cover_image_url, created_at, published, author_id,
      profiles!author_id ( display_name ),
      comments ( count )
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })

  const postsWithCount = (posts ?? []).map(p => ({
    ...p,
    profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
    comment_count: (p.comments as unknown as { count: number }[])?.[0]?.count ?? 0,
  }))

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pb-20">
        {/* Hero */}
        <div className="text-center py-14 sm:py-20">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-warm-text leading-tight mb-4">
            Mike & Irene&apos;s<br />
            <span className="text-warm-accent">Travel Blog</span>
          </h1>
        </div>

        {/* Post feed */}
        {postsWithCount.length === 0 ? (
          <div className="text-center py-16 text-warm-muted">
            <p className="font-serif text-xl mb-2">No posts yet</p>
            <p className="text-sm">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {postsWithCount.map(post => (
              <PostCard key={post.id} post={post as any} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-warm-border text-center py-6 text-sm text-warm-muted">
        Made with love for Mum & Dad
      </footer>
    </>
  )
}
