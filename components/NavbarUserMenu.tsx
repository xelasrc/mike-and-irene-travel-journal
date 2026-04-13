'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { signOutAction } from '@/app/actions/auth'

export default function NavbarUserMenu({
  displayName,
  isAdmin,
}: {
  displayName: string
  isAdmin: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    setMenuOpen(false)
    await signOutAction()
  }

  return (
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
          <div className="absolute right-0 mt-2 w-52 rounded-xl border border-warm-border bg-white shadow-lg z-20 py-1 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-warm-border">
              <p className="text-xs text-warm-muted">Signed in as</p>
              <p className="font-semibold text-sm text-warm-text truncate">{displayName}</p>
              {isAdmin && (
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-warm-accent/10 text-warm-accent font-medium border border-warm-accent/20">
                  Admin
                </span>
              )}
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
  )
}
