"use client"
import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import { fetchCurrentUser } from '@/lib/auth/client'

export default function AdminOrderDetail(){
  const router = useRouter()
  const params = useParams()
  const id = params?.id
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    fetchCurrentUser().then(async (u:any)=>{
      if(!u){ router.push('/login'); return }
      if(u.role !== 'ADMIN'){ router.push('/dashboard'); return }
      setUser(u)
      try{
        const token = localStorage.getItem('chrono_token')
        const headers: Record<string,string> = {}
        if(token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch(`/api/admin/orders/${id}`, { headers, credentials: 'include' })
        const data = await res.json()
        if(!res.ok || !data?.ok) { setError(data?.message || 'Failed to load order') }
        else { setOrder(data.order); setStatus(data.order.orderStatus) }
      }catch(err:any){ setError(err?.message || 'Failed to load order') }
      setLoading(false)
    })
  },[id])

  if(loading) return <div className="container py-12">Loading order...</div>

  if(!order) return <div className="container py-12">{error ?? 'Order not found'}</div>

  async function saveStatus(){
    setSaving(true)
    try{
      const token = localStorage.getItem('chrono_token')
      const headers: Record<string,string> = {'Content-Type':'application/json'}
      if(token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ orderStatus: status }) })
      const data = await res.json()
      if(!res.ok || !data?.ok) { setError(data?.message || 'Failed to update'); setSaving(false); return }
      setOrder(data.order)
      setError(null)
      setSaving(false)
      alert('Order status updated')
    }catch(err:any){ setError(err?.message || 'Failed to update'); setSaving(false) }
  }

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif">Order {order.orderNumber}</h1>
        <Button onClick={()=>router.push('/admin/orders')} className="text-sm text-slate-600" variant="ghost">Back to orders</Button>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Customer</h3>
          <div className="mt-2 text-sm">{order.user?.name || order.user?.email}</div>
          <div className="text-xs text-slate-500">{order.user?.email}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Shipping Address</h3>
          <div className="mt-2 text-sm">{order.shippingAddress?.fullName}</div>
          <div className="text-sm">{order.shippingAddress?.line1} {order.shippingAddress?.line2}</div>
          <div className="text-sm">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</div>
          <div className="text-sm">{order.shippingAddress?.country}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Payment</h3>
          <div className="mt-2 text-sm">Method: {order.paymentMethod}</div>
          <div className="text-sm">Status: {order.paymentStatus}</div>
          <div className="mt-3">
            <label className="block text-sm mb-1">Order Status</label>
            <select value={status ?? ''} onChange={e=>setStatus(e.target.value)} className="w-full border rounded p-2">
              <option value="PLACED">PLACED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <div className="mt-3">
              <Button disabled={saving} onClick={saveStatus} className="px-4 py-2" variant="ghost">Save Status</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded shadow p-4">
        <h3 className="font-semibold">Items</h3>
        <div className="mt-3">
          {order.items.map((it:any)=> (
            <div key={it.id} className="flex items-center gap-4 border-t py-3">
              <img src={it.product?.images?.[0]?.url} alt={it.product?.images?.[0]?.altText || it.product?.title} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium">{it.product?.title}</div>
                <div className="text-sm text-slate-500">Qty: {it.quantity} × ${(it.unitPrice/100).toFixed(2)}</div>
              </div>
              <div className="font-medium">${((it.unitPrice * it.quantity)/100).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right">
          <div className="text-sm">Subtotal: ${(order.subtotal/100).toFixed(2)}</div>
          <div className="text-sm">Shipping: ${(order.shipping/100).toFixed(2)}</div>
          <div className="text-lg font-semibold">Total: ${(order.total/100).toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}
