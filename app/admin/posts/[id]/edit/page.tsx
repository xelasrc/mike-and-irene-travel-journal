import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import PostEditor from '@/components/PostEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*, post_images(id, image_url, caption, display_order)')
    .eq('id', id)
    .single()

  if (!post) notFound()

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-warm-muted hover:text-warm-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
        <h1 className="font-serif text-3xl font-bold text-warm-text mb-8">Edit post</h1>
        <PostEditor post={post} />
      </main>
    </>
  )
}
