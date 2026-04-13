'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/'
  const urlError = searchParams.get('error')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Incorrect email or password. Please try again.')
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-warm-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-warm-accent mb-4">
            <MapPin className="w-5 h-5" />
            <span className="font-serif text-xl font-semibold">Mike & Irene&apos;s Adventure</span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-warm-text">Welcome back</h1>
          <p className="text-warm-muted text-sm mt-1">Sign in to leave comments</p>
        </div>

        <div className="bg-white rounded-2xl border border-warm-border p-6 shadow-sm">
          {(error || urlError) && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
              {error ?? urlError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-text mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-warm-border bg-warm-bg px-4 py-2.5 text-warm-text placeholder-warm-muted focus:outline-none focus:ring-2 focus:ring-warm-accent/30 focus:border-warm-accent transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-text mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-warm-border bg-warm-bg px-4 py-2.5 text-warm-text placeholder-warm-muted focus:outline-none focus:ring-2 focus:ring-warm-accent/30 focus:border-warm-accent transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-warm-accent text-white rounded-full py-2.5 font-medium hover:bg-warm-accent-dark transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-warm-muted mt-5">
          No account?{' '}
          <Link href="/register" className="text-warm-accent font-medium hover:underline">
            Create one
          </Link>
        </p>
        <p className="text-center text-sm text-warm-muted mt-2">
          <Link href="/" className="text-warm-muted hover:text-warm-accent transition-colors">
            ← Back to posts
          </Link>
        </p>
      </div>
    </main>
  )
}
