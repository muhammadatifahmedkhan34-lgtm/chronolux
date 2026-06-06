import Link from 'next/link'
import React from 'react'

export default function Navbar(){
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-serif text-dark-brown">ChronoLux</Link>
        <nav className="space-x-6">
          <Link href="/shop" className="text-sm text-slate-700">Shop</Link>
          <Link href="/about" className="text-sm text-slate-700">About</Link>
          <Link href="/login" className="text-sm text-slate-700">Login</Link>
          <Link href="/register" className="text-sm text-slate-700">Register</Link>
        </nav>
      </div>
    </header>
  )
}
