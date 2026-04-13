'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MapPin, BookOpen, LogIn, LogOut } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Pick<Profile, 'display_name' | 'role'> | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) return

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        setProfile(existingProfile)
        return
      }

      // Profile missing (trigger may have failed) — insert one now
      // Use INSERT (not upsert) so we never overwrite an existing role
      const displayName = user.user_metadata?.display_name
        ?? user.email?.split('@')[0]
        ?? 'User'

      await supabase.from('profiles').insert({
        id: user.id,
        display_name: displayName,
        role: 'viewer',
      })

      setProfile({ display_name: displayName, role: 'viewer' })
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)

      if (!session?.user) {
        setProfile(null)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', session.user.id)
        .single()

      setProfile(data ?? {
        display_name: session.user.user_metadata?.display_name
          ?? session.user.email?.split('@')[0]
          ?? 'User',
        role: 'viewer',
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    setMenuOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isAdmin = profile?.role === 'admin'
  // Show as logged in as soon as we know there's a user, even before profile loads
  const displayName = profile?.display_name
    ?? user?.user_metadata?.display_name
    ?? user?.email?.split('@')[0]
    ?? 'User'

  return (
    <header className="sticky top-0 z-40 border-b border-warm-border bg-warm-bg/95 backdrop-blur-sm">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
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

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-warm-accent text-white'
                  : 'text-warm-muted hover:text-warm-accent hover:bg-warm-bg-2'
              )}
            >
              <BookOpen className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 text-sm text-warm-text hover:text-warm-accent transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-warm-accent text-white flex items-center justify-center font-semibold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{displayName}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-warm-border bg-white shadow-lg z-20 py-1 overflow-hidden">
                    <div className="px-4 py-2 border-b border-warm-border">
                      <p className="text-xs text-warm-muted">Signed in as</p>
                      <p className="font-semibold text-sm text-warm-text truncate">{displayName}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-warm-muted hover:bg-warm-bg-2 hover:text-warm-accent transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
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
