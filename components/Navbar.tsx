import Link from 'next/link'
import Image from 'next/image'
import NavbarAuth from './NavbarAuth'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-warm-border bg-warm-bg/95 backdrop-blur-sm">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-warm-accent hover:text-warm-accent-dark transition-colors"
        >
          <Image src="/favicon/apple-touch-icon.png" alt="" width={28} height={28} className="rounded-md" />
          <span className="font-serif font-semibold text-lg leading-none hidden sm:block">
            Mike & Irene&apos;s Travel Blog
          </span>
          <span className="font-serif font-semibold text-lg leading-none sm:hidden">
            M&I Travel Blog
          </span>
        </Link>

        <NavbarAuth />
      </nav>
    </header>
  )
}
