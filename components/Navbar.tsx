import Link from 'next/link'
import { MapPin, BookOpen, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import NavbarUserMenu from './NavbarUserMenu'

interface NavbarProps {
  // Optional: pass pre-fetched auth data from the page to avoid a duplicate DB call
  user?: { displayName: string; isAdmin: boolean } | null
}

export default async function Navbar({ user: prefetched }: NavbarProps = {}) {
  let displayName = 'User'
  let isAdmin = false
  let isLoggedIn = false

  if (prefetched !== undefined) {
    // Page already fetched auth — reuse it
    isLoggedIn = prefetched !== null
    displayName = prefetched?.displayName ?? 'User'
    isAdmin = prefetched?.isAdmin ?? false
  } else {
    // Fetch ourselves (used on pages that don't pass auth down)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isLoggedIn = !!user

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', user.id)
        .single()

      isAdmin = profile?.role === 'admin'
      displayName =
        profile?.display_name ??
        user.user_metadata?.display_name ??
        user.email?.split('@')[0] ??
        'User'
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-warm-border bg-warm-bg/95 backdrop-blur-sm">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-warm-accent hover:text-warm-accent-dark transition-colors"
        >
          <MapPin className="w-4 h-4" />
          <span className="font-serif font-semibold text-lg leading-none hidden sm:block">
            Mike & Irene&apos;s Travel Blog
          </span>
          <span className="font-serif font-semibold text-lg leading-none sm:hidden">
            M&I Travel Blog
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-warm-accent/10 text-warm-accent border border-warm-accent/30 hover:bg-warm-accent hover:text-white transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          )}

          {isLoggedIn ? (
            <NavbarUserMenu displayName={displayName} isAdmin={isAdmin} />
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-warm-accent text-white hover:bg-warm-accent-dark transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
