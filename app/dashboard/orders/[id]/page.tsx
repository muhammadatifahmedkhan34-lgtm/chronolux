"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OrderDetailPage({ params }: any){
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(()=>{
    ;(async()=>{
      setLoading(true)
      try{
        const res = await fetch(`/api/orders/${params.id}`, { credentials: 'include' })
        const text = await res.text(); const json = text ? JSON.parse(text) : null
        if(!res.ok){ if(res.status === 401) return router.push('/login'); throw new Error(json?.message || 'Failed') }
        setOrder(json.order)
      }catch(err:any){ alert(err?.message || 'Failed to load order') }
      finally{ setLoading(false) }
    })()
  },[params])

  if(loading) return <div className="container py-8">Loading...</div>
  if(!order) return <div className="container py-8">Order not found.</div>

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-serif">Order {order.orderNumber}</h1>
      <div className="mt-4">Payment: {order.paymentMethod} — {order.paymentStatus}</div>
      <div className="mt-4">Status: {order.orderStatus}</div>

      <div className="mt-6">
        <h2 className="font-semibold">Items</h2>
        <div className="mt-3">
          {order.items.map((it:any)=>(
            <div key={it.id} className="flex items-center gap-3 border-b py-2">
              <img src={it.product.images[0]?.url} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">{it.product.title}</div>
              <div className="font-semibold">{it.quantity} × ${(it.unitPrice/100).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold">Shipping</h2>
        <div className="mt-2">
          <div>{order.shippingAddress?.fullName}</div>
          <div>{order.shippingAddress?.line1}</div>
          <div>{order.shippingAddress?.city} {order.shippingAddress?.postalCode}</div>
          <div>{order.shippingAddress?.country}</div>
          <div>{order.shippingAddress?.phone}</div>
        </div>
      </div>
    </div>
  )
}
