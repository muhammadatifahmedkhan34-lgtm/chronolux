"use client"
import Link from 'next/link'
import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getToken, fetchCurrentUser, logout } from '@/lib/auth/client'

import { useEffect, useState } from 'react'

export default function Navbar(){
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(()=>{
    const t = getToken()
    if(!t) return
    fetchCurrentUser().then(u=>{
      if(u?.role) setUserRole(u.role)
    })
  },[])

  const handleLogout = ()=>{
    // clear server cookie too
    fetch('/api/auth/logout', { method: 'POST' }).finally(()=>{
      logout()
      router.push('/login')
    })
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-serif text-dark-brown">ChronoLux</Link>
        <nav className="space-x-6">
          <Link href="/shop" className="text-sm text-slate-700">Shop</Link>
          <Link href="/about" className="text-sm text-slate-700">About</Link>
          {!userRole && (
            <>
              <Link href="/login" className="text-sm text-slate-700">Login</Link>
              <Link href="/register" className="text-sm text-slate-700">Register</Link>
            </>
          )}
          {userRole && (
            <>
              {userRole === 'ADMIN' ? <Link href="/admin" className="text-sm text-slate-700">Admin</Link> : <Link href="/dashboard" className="text-sm text-slate-700">Dashboard</Link>}
              <button onClick={handleLogout} className="text-sm text-slate-700">Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
