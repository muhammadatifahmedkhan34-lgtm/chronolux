import React from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Link from 'next/link'

export const metadata = {
  title: 'Admin - ChronoLux'
}

export default function AdminLayout({ children }: { children: React.ReactNode }){
  const mobileItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/coupons', label: 'Coupons' },
    { href: '/admin/reviews', label: 'Reviews' },
    { href: '/admin/reports', label: 'Reports' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-4">
        {/* Mobile horizontal nav (visible on small screens) */}
        <div className="md:hidden overflow-x-auto mb-4">
          <div className="flex gap-2">
            {mobileItems.map(i=> (
              <Link key={i.href} href={i.href} className="px-3 py-2 whitespace-nowrap rounded bg-white border text-slate-700">{i.label}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <AdminSidebar />
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
