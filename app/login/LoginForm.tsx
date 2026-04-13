'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { signInAction } from '@/app/actions/auth'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/'
  const urlError = searchParams.get('error')

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-warm-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-warm-accent mb-4">
            <MapPin className="w-5 h-5" />
            <span className="font-serif text-xl font-semibold">Mike & Irene&apos;s Travel Blog</span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-warm-text">Welcome back</h1>
          <p className="text-warm-muted text-sm mt-1">Sign in to leave comments</p>
        </div>

        <div className="bg-white rounded-2xl border border-warm-border p-6 shadow-sm">
          {urlError && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
              {decodeURIComponent(urlError)}
            </div>
          )}

          <form action={signInAction} className="space-y-4">
            {/* Pass redirect target through the form */}
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div>
              <label className="block text-sm font-medium text-warm-text mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
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
                name="password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-warm-border bg-warm-bg px-4 py-2.5 text-warm-text placeholder-warm-muted focus:outline-none focus:ring-2 focus:ring-warm-accent/30 focus:border-warm-accent transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center bg-warm-accent text-white rounded-full py-2.5 font-medium hover:bg-warm-accent-dark transition-colors"
            >
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
