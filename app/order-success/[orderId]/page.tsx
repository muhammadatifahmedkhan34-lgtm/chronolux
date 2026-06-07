"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OrderSuccessPage({ params }: any){
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(()=>{
    ;(async()=>{
      setLoading(true)
      try{
        const res = await fetch(`/api/orders/${params.orderId}`, { credentials: 'include' })
        const text = await res.text(); const json = text ? JSON.parse(text) : null
        if(!res.ok) { alert(json?.message || 'Order not found'); router.push('/'); return }
        setOrder(json.order)
      }catch(err){ alert('Failed to load order') }
      finally{ setLoading(false) }
    })()
  },[params])

  if(loading) return <div className="container py-8">Loading...</div>
  if(!order) return <div className="container py-8">Order not found.</div>

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-serif">Order placed successfully</h1>
      <div className="mt-4">
        <div>Order number: <strong>{order.orderNumber}</strong></div>
        <div>Payment method: {order.paymentMethod}</div>
        <div>Payment status: {order.paymentStatus}</div>
        <div>Order status: {order.orderStatus}</div>
      </div>
      <div className="mt-6">
        <h2 className="font-semibold">Order summary</h2>
        <div className="mt-3">
          {order.items.map((it:any)=>(
            <div key={it.id} className="flex items-center gap-3 border-b py-2">
              <img src={it.product.images[0]?.url} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">{it.product.title}</div>
              <div className="font-semibold">${((it.unitPrice * it.quantity)/100).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <a href="/shop" className="px-4 py-2 border rounded">Continue shopping</a>
        <a href="/dashboard/orders" className="px-4 py-2 bg-dark-brown text-white rounded">View orders</a>
      </div>
    </div>
  )
}
