import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import PhotoGallery from '@/components/PhotoGallery'
import CommentThread from '@/components/CommentThread'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
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
  const supabase = await createClient()

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

  const { data: comments } = await supabase
    .from('comments')
    .select(`
      id, post_id, author_id, parent_id, content, created_at,
      profiles!author_id ( display_name, role )
    `)
    .eq('post_id', post.id)
    .order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  const { data: currentProfile } = user
    ? await supabase
        .from('profiles')
        .select('id, display_name, role')
        .eq('id', user.id)
        .single()
    : { data: null }

  const sortedImages = (post.post_images ?? []).sort(
    (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
  )
  const coverImage = sortedImages[0]?.image_url ?? post.cover_image_url
  const galleryImages = sortedImages.slice(coverImage ? 0 : 0)

  const paragraphs = post.content.split('\n').filter((p: string) => p.trim())

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pb-20">
        {/* Back link */}
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
          {/* Cover image */}
          {coverImage && (
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden mb-8">
              <Image
                src={coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Meta */}
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

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-warm-text leading-tight mb-8">
            {post.title}
          </h1>

          {/* Content */}
          <div className="post-content mb-10">
            {paragraphs.map((para: string, i: number) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Photo gallery (all images) */}
          {sortedImages.length > 0 && (
            <div className="mb-10">
              <h2 className="font-serif text-xl font-semibold text-warm-text mb-4">
                Photos from the day
              </h2>
              <PhotoGallery images={sortedImages} />
            </div>
          )}

          {/* Comments */}
          <CommentThread
            initialComments={(comments ?? []).map((c: any) => ({
              ...c,
              profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
            }))}
            postId={post.id}
            postSlug={post.slug}
            currentUser={currentProfile}
          />
        </article>
      </main>

      <footer className="border-t border-warm-border text-center py-6 text-sm text-warm-muted">
        Made with love for Mike & Irene ♥
      </footer>
    </>
  )
}
