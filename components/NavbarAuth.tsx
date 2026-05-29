'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import NavbarUserMenu from './NavbarUserMenu'

type AuthState =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'user'; displayName: string; isAdmin: boolean }

export default function NavbarAuth() {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAuth({ status: 'guest' }); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', user.id)
        .single()

      setAuth({
        status: 'user',
        displayName: profile?.display_name ?? user.email?.split('@')[0] ?? 'User',
        isAdmin: profile?.role === 'admin',
      })
    }

    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load())
    return () => subscription.unsubscribe()
  }, [])

  if (auth.status === 'loading') {
    return <div className="w-8 h-8 rounded-full bg-warm-border animate-pulse" />
  }

  if (auth.status === 'guest') {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-warm-accent text-white hover:bg-warm-accent-dark transition-colors"
      >
        <LogIn className="w-4 h-4" />
        <span>Sign in</span>
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {auth.isAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-warm-accent/10 text-warm-accent border border-warm-accent/30 hover:bg-warm-accent hover:text-white transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Admin</span>
        </Link>
      )}
      <NavbarUserMenu displayName={auth.displayName} isAdmin={auth.isAdmin} />
    </div>
  )
}
