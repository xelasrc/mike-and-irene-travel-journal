'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterForm() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (displayName.trim().length < 2) {
      setError('Please enter your name (at least 2 characters).')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName.trim() },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Email confirmation is disabled — log them straight in
    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-warm-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-warm-accent mb-4">
            <MapPin className="w-5 h-5" />
            <span className="font-serif text-xl font-semibold">Mike & Irene&apos;s Travel Blog</span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-warm-text">Join the journey</h1>
          <p className="text-warm-muted text-sm mt-1">Create an account to leave comments</p>
        </div>

        <div className="bg-white rounded-2xl border border-warm-border p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-text mb-1.5">
                Your name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                autoComplete="name"
                className="w-full rounded-xl border border-warm-border bg-warm-bg px-4 py-2.5 text-warm-text placeholder-warm-muted focus:outline-none focus:ring-2 focus:ring-warm-accent/30 focus:border-warm-accent transition"
                placeholder="Jane Smith"
              />
              <p className="text-xs text-warm-muted mt-1">This is how you&apos;ll appear on comments.</p>
            </div>

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
                autoComplete="new-password"
                className="w-full rounded-xl border border-warm-border bg-warm-bg px-4 py-2.5 text-warm-text placeholder-warm-muted focus:outline-none focus:ring-2 focus:ring-warm-accent/30 focus:border-warm-accent transition"
                placeholder="At least 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-warm-accent text-white rounded-full py-2.5 font-medium hover:bg-warm-accent-dark transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create account
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-warm-muted mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-warm-accent font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
