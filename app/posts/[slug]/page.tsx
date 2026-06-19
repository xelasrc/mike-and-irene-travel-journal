import { notFound } from 'next/navigation'
import { MapPin, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import PhotoGallery from '@/components/PhotoGallery'
import CommentThread from '@/components/CommentThread'
import { formatDate } from '@/lib/utils'

// Pre-render at deploy, revalidate every 60s in background — served from CDN
export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

function getSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function generateStaticParams() {
  const { data } = await getSupabase()
    .from('posts')
    .select('slug')
    .eq('published', true)
  return (data ?? []).map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const { data } = await getSupabase()
    .from('posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .single()
  return {
    title: data?.title ?? 'Post not found',
    description: data?.excerpt,
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = getSupabase()

  // Fetch post (no cookies needed — content is publicly readable)
  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!author_id ( display_name ),
      post_images ( id, image_url, caption, display_order )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  // Fetch comments in parallel with nothing else to wait for
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      id, post_id, author_id, parent_id, content, created_at,
      profiles!author_id ( display_name, role )
    `)
    .eq('post_id', post.id)
    .order('created_at', { ascending: true })

  const sortedImages = (post.post_images ?? []).sort(
    (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
  )

  const paragraphs = post.content.split('\n').filter((p: string) => p.trim())

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pb-20">
        <div className="py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-warm-muted hover:text-warm-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All posts
          </Link>
        </div>

        <article>
          <div className="flex flex-wrap items-center gap-3 text-sm text-warm-muted mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.created_at)}
            </span>
            {post.location && (
              <span className="flex items-center gap-1 text-warm-accent font-medium">
                <MapPin className="w-3.5 h-3.5" />
                {post.location}
              </span>
            )}
            <span className="text-warm-muted">
              by {(Array.isArray(post.profiles) ? post.profiles[0] : post.profiles)?.display_name ?? 'Mike'}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-warm-text leading-tight mb-8">
            {post.title}
          </h1>

          <div className="post-content mb-10">
            {paragraphs.map((para: string, i: number) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {sortedImages.length > 0 && (
            <div className="mb-10 -mx-4 sm:mx-0">
              <PhotoGallery images={sortedImages} />
            </div>
          )}

          <CommentThread
            initialComments={(comments ?? []).map((c: any) => ({
              ...c,
              profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
            }))}
            postId={post.id}
            postSlug={post.slug}
          />
        </article>
      </main>

      <footer className="border-t border-warm-border text-center py-8 text-sm text-warm-muted">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-warm-accent text-white px-6 py-3 rounded-full font-medium hover:bg-warm-accent-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to feed
        </Link>
        <p className="mt-3">Made with love for Mike & Irene ♥</p>
      </footer>
    </>
  )
}
