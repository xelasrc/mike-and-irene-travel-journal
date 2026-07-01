import { createClient } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import TravelMapWrapper from '@/components/TravelMapWrapper'

// No cookies needed — posts are public. True ISR: served from CDN, revalidated every 60s.
export const revalidate = 60

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: ping } = await supabase
    .from('travel_ping')
    .select('lat, lng, city, country, updated_at')
    .eq('id', 1)
    .single()

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id, slug, title, excerpt, location, cover_image_url, cover_position, created_at, published, author_id,
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
      <main className="max-w-2xl mx-auto px-4 pb-16">
        <div className="text-center py-10 sm:py-16">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-warm-text leading-tight mb-3">
            Mike & Irene&apos;s<br />
            <span className="text-warm-accent">Travel Blog</span>
          </h1>
          <p className="text-warm-muted text-sm sm:text-base max-w-xs sm:max-w-md mx-auto leading-relaxed">
            A private journal for friends and family — follow along on the adventure.
          </p>
        </div>

        {ping && (
          <TravelMapWrapper
            lat={ping.lat}
            lng={ping.lng}
            city={ping.city}
            country={ping.country}
            updatedAt={ping.updated_at}
          />
        )}

        {postsWithCount.length === 0 ? (
          <div className="text-center py-16 text-warm-muted">
            <p className="font-serif text-xl mb-2">No posts yet</p>
            <p className="text-sm">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {postsWithCount.map((post, i) => (
              <PostCard key={post.id} post={post as any} isFirst={i === 0} />
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
