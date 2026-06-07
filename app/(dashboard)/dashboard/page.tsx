"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchCurrentUser } from '@/lib/auth/client'

export default function DashboardIndex(){
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(()=>{
    ;(async()=>{
      setLoading(true)
      try{
        const res = await fetch('/api/dashboard', { credentials: 'include' })
        const text = await res.text(); const json = text ? JSON.parse(text) : null
        if(!res.ok){ if(res.status === 401) return router.push('/login'); if(res.status === 403) return router.push('/admin'); throw new Error(json?.message || 'Failed') }
        setData(json)
      }catch(err:any){ alert(err?.message || 'Failed to load dashboard') }
      finally{ setLoading(false) }
    })()
  },[])

  if(loading) return <div className="container py-12">Loading...</div>

  const user = data?.user
  const stats = data?.stats || {}

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-serif">Welcome, {user?.name || user?.email}</h1>
      <p className="mt-2 text-slate-600">Manage your orders, wishlist, reviews and account settings.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <a href="/dashboard/orders" className="block p-6 bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-lg shadow-lg">
          <div className="text-sm">My Orders</div>
          <div className="mt-2 text-2xl font-bold">{stats.totalOrders ?? 0}</div>
        </a>

        <a href="/wishlist" className="block p-6 bg-white border rounded-lg shadow hover:shadow-md">
          <div className="text-sm text-slate-600">Wishlist</div>
          <div className="mt-2 text-2xl font-bold">{stats.wishlistItems ?? 0}</div>
        </a>

        <a href="/cart" className="block p-6 bg-white border rounded-lg shadow hover:shadow-md">
          <div className="text-sm text-slate-600">Cart Items</div>
          <div className="mt-2 text-2xl font-bold">{stats.cartItems ?? 0}</div>
        </a>

        <a href="/dashboard/reviews" className="block p-6 bg-white border rounded-lg shadow hover:shadow-md">
          <div className="text-sm text-slate-600">My Reviews</div>
          <div className="mt-2 text-2xl font-bold">{stats.reviewsSubmitted ?? 0}</div>
        </a>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/dashboard/account" className="col-span-1 p-6 bg-white border rounded-lg shadow hover:shadow-md">
          <div className="text-sm text-slate-600">Account Settings</div>
          <div className="mt-2 text-base">Manage your profile and preferences</div>
        </a>

        <div className="md:col-span-2 p-6 bg-white border rounded-lg shadow">
          <h3 className="font-semibold">Recent Orders</h3>
          {(!data?.recentOrders || data.recentOrders.length === 0) ? (
            <div className="mt-4 text-slate-600">No recent orders.</div>
          ) : (
            <div className="mt-4">
              <ul className="space-y-3">
                {data.recentOrders.map((o:any)=>(
                  <li key={o.id} className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium">{o.orderNumber}</div>
                      <div className="text-xs text-slate-500">{new Date(o.placedAt).toLocaleString()}</div>
                    </div>
                    <div className="text-sm">${(o.total/100).toFixed(2)}</div>
                    <a href={`/dashboard/orders/${o.id}`} className="ml-4 text-blue-600">View</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
