"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchCurrentUser } from '@/lib/auth/client'
import Link from 'next/link'

export default function AdminIndex(){
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    fetchCurrentUser().then(async (u:any)=>{
      if(!u){ router.push('/login'); return }
      if(u.role !== 'ADMIN'){ router.push('/dashboard'); return }
      setUser(u)
      try{
        const token = localStorage.getItem('chrono_token')
        const headers: Record<string,string> = {}
        if(token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch('/api/admin/dashboard', { headers, credentials: 'include' })
        const data = await res.json()
        if(!res.ok || !data?.ok) { setError(data?.message || 'Failed to load stats') }
        else setStats(data)
      }catch(err:any){ setError(err?.message || 'Failed to load stats') }
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
          <div className="mt-2 text-2xl font-semibold">{error ? '—' : (stats?.stats?.totalProducts ?? '—')}</div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="text-sm text-slate-500">Total Orders</div>
          <div className="mt-2 text-2xl font-semibold">{error ? '—' : (stats?.stats?.totalOrders ?? '—')}</div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="text-sm text-slate-500">Total Users</div>
          <div className="mt-2 text-2xl font-semibold">{error ? '—' : (stats?.stats?.totalUsers ?? '—')}</div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="text-sm text-slate-500">Revenue</div>
          <div className="mt-2 text-2xl font-semibold">{error ? '—' : `$${((stats?.stats?.totalRevenue ?? 0)/100).toFixed(2)}`}</div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/products" className="block text-center py-4 bg-gold text-white rounded-md shadow">Manage Products</Link>
        <Link href="/admin/orders" className="block text-center py-4 bg-dark-brown text-white rounded-md shadow">View Orders</Link>
        <Link href="/admin/users" className="block text-center py-4 border border-slate-200 rounded-md">Manage Users</Link>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Recent Orders</h2>
        {error && <div className="text-red-600">{error}</div>}
        {!error && !stats?.recentOrders?.length && <div className="text-slate-500">No recent orders</div>}
        {!error && stats?.recentOrders?.length > 0 && (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o:any)=> (
                  <tr key={o.id} className="border-t">
                    <td className="p-3">{o.orderNumber}</td>
                    <td className="p-3">{o.user?.email || o.user?.name}</td>
                    <td className="p-3">{new Date(o.placedAt).toLocaleString()}</td>
                    <td className="p-3">${(o.total/100).toFixed(2)}</td>
                    <td className="p-3">{o.orderStatus}</td>
                    <td className="p-3"><Link href={`/admin/orders/${o.id}`} className="text-blue-600">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
