'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MapPin, BookOpen, LogIn, LogOut, Settings } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const [profile, setProfile] = useState<Pick<Profile, 'display_name' | 'role'> | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfile(null); return }

      const { data } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', user.id)
        .single()

      setProfile(data)
    }

    loadProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('display_name, role')
          .eq('id', session.user.id)
          .single()
        setProfile(data)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    setMenuOpen(false)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8d5be] bg-[#fdf8f0]/95 backdrop-blur-sm">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#c2621a] hover:text-[#9a4e15] transition-colors"
        >
          <MapPin className="w-4 h-4" />
          <span className="font-serif font-semibold text-lg leading-none hidden sm:block">
            Mike & Irene&apos;s Adventure
          </span>
          <span className="font-serif font-semibold text-lg leading-none sm:hidden">
            M&I Adventures
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
                  ? 'bg-[#c2621a] text-white'
                  : 'text-[#8b6e5a] hover:text-[#c2621a] hover:bg-[#faf3e8]'
              )}
            >
              <BookOpen className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          )}

          {profile ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 text-sm text-[#2d1b0e] hover:text-[#c2621a] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#c2621a] text-white flex items-center justify-center font-semibold text-sm">
                  {profile.display_name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{profile.display_name}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#e8d5be] bg-white shadow-lg z-20 py-1 overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#e8d5be]">
                      <p className="text-xs text-[#8b6e5a]">Signed in as</p>
                      <p className="font-semibold text-sm text-[#2d1b0e] truncate">{profile.display_name}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#8b6e5a] hover:bg-[#faf3e8] hover:text-[#c2621a] transition-colors"
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
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-[#c2621a] text-white hover:bg-[#9a4e15] transition-colors"
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
