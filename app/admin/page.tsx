"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchCurrentUser } from '@/lib/auth/client'
import Link from 'next/link'

export default function AdminIndex(){
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(()=>{
    fetchCurrentUser().then(u=>{
      if(!u){ router.push('/login'); return }
      if(u.role !== 'ADMIN'){ router.push('/dashboard'); return }
      setUser(u)
      setLoading(false)
    })
  },[])

  if(loading) return <div className="container py-12">Loading admin...</div>

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-dark-brown">ChronoLux Admin</h1>
          <p className="mt-2 text-slate-600">Manage products, orders, users, reports, and inventory.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600">Signed in as</div>
          <div className="font-medium">{user?.name || user?.email}</div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="text-sm text-slate-500">Total Products</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="text-sm text-slate-500">Total Orders</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="text-sm text-slate-500">Total Users</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="text-sm text-slate-500">Revenue</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/products" className="block text-center py-4 bg-gold text-white rounded-md shadow">Manage Products</Link>
        <Link href="/admin/orders" className="block text-center py-4 bg-dark-brown text-white rounded-md shadow">View Orders</Link>
        <Link href="/admin/users" className="block text-center py-4 border border-slate-200 rounded-md">Manage Users</Link>
      </div>
    </div>
  )
}
