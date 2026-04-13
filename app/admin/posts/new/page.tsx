import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import PostEditor from '@/components/PostEditor'

export default function NewPostPage() {
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
        <h1 className="font-serif text-3xl font-bold text-warm-text mb-8">Write a new post</h1>
        <PostEditor />
      </main>
    </>
  )
}
