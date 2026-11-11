'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#hero" className="font-display text-lg text-white">
          Jaydin
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex items-center py-2 text-sm text-gray-300 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Button href="#contact" variant="secondary" className="hidden px-4 py-2 text-xs sm:text-sm md:inline-flex">
          Contact Me
        </Button>

        <button
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation-drawer"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:hidden"
        >
          <span className="sr-only">Menu</span>
          <div className="flex w-4 flex-col gap-1.5">
            <span className={`block h-0.5 w-full bg-white transition ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-full bg-white transition ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-full bg-white transition ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </div>

      <div
        id="mobile-navigation-drawer"
        aria-hidden={!menuOpen}
        className={`mobile-nav ${menuOpen ? 'open' : ''}`}
      >
        <nav aria-label="Mobile" className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 pb-4 pt-2 sm:px-6 md:hidden">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={closeMenu}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-100 transition hover:border-white/30 hover:bg-white/10"
            >
              {item.label}
            </a>
          ))}
          <Button
            href="#contact"
            variant="secondary"
            tabIndex={menuOpen ? 0 : -1}
            className="mt-1 w-full py-3 text-sm"
            onClick={closeMenu}
          >
            Contact Me
          </Button>
        </nav>
      </div>
    </header>
  )
}
