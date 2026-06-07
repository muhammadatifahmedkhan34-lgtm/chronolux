"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchCurrentUser } from '@/lib/auth/client'
import Link from 'next/link'

export default function AdminOrdersPage(){
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
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
        const res = await fetch('/api/admin/orders', { headers, credentials: 'include' })
        const data = await res.json()
        if(!res.ok || !data?.ok) { setError(data?.message || 'Failed to load orders') }
        else setOrders(data.orders)
      }catch(err:any){ setError(err?.message || 'Failed to load orders') }
      setLoading(false)
    })
  },[])

  if(loading) return <div className="container py-12">Loading orders...</div>

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif">Orders</h1>
        <Link href="/admin" className="text-sm text-slate-600">Back to dashboard</Link>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      <div className="mt-6 overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Payment Status</th>
              <th className="p-3">Order Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o=> (
              <tr key={o.id} className="border-t">
                <td className="p-3">{o.orderNumber}</td>
                <td className="p-3">{o.user?.email || o.user?.name}</td>
                <td className="p-3">{new Date(o.placedAt).toLocaleString()}</td>
                <td className="p-3">${(o.total/100).toFixed(2)}</td>
                <td className="p-3">{o.paymentMethod}</td>
                <td className="p-3">{o.paymentStatus}</td>
                <td className="p-3">{o.orderStatus}</td>
                <td className="p-3"><Link href={`/admin/orders/${o.id}`} className="text-blue-600">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
