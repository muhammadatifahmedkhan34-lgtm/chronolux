"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSidebar(){
  const pathname = usePathname() || ''
  const items = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/coupons', label: 'Coupons' },
    { href: '/admin/reviews', label: 'Reviews' },
    { href: '/admin/reports', label: 'Reports' },
  ]

  return (
    <aside className="hidden md:block w-56 bg-white border-r h-screen sticky top-0">
      <div className="p-4">
        <div className="text-xl font-serif mb-4">Admin</div>
        <nav className="flex flex-col gap-1">
          {items.map(i=> (
            <Link key={i.href} href={i.href} className={`block px-3 py-2 rounded ${pathname === i.href ? 'bg-slate-100 font-semibold' : 'text-slate-600'}`}>
              {i.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
