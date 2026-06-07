"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OrdersPage(){
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(()=>{
    ;(async()=>{
      setLoading(true)
      try{
        const res = await fetch('/api/orders', { credentials: 'include' })
        const text = await res.text(); const json = text ? JSON.parse(text) : null
        if(!res.ok){ if(res.status === 401) return router.push('/login'); throw new Error(json?.message || 'Failed') }
        setOrders(json.orders || [])
      }catch(err:any){ alert(err?.message || 'Failed to load orders') }
      finally{ setLoading(false) }
    })()
  },[])

  if(loading) return <div className="container py-8">Loading...</div>

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-serif">Your Orders</h1>
      <div className="mt-2 text-sm text-slate-600">Open order details to leave feedback on purchased watches.</div>
      {orders.length === 0 ? (
        <div className="mt-6">
          <div className="text-slate-600">You have not placed any orders yet.</div>
          <div className="mt-4"><a href="/shop" className="px-4 py-2 bg-dark-brown text-white rounded">Continue Shopping</a></div>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2">Order</th>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Total</th>
                <th className="text-left p-2">Payment</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o=> (
                <tr key={o.id} className="border-t">
                  <td className="p-2">{o.orderNumber}</td>
                  <td className="p-2">{new Date(o.placedAt).toLocaleString()}</td>
                  <td className="p-2">${(o.total/100).toFixed(2)}</td>
                  <td className="p-2">{o.paymentStatus}</td>
                  <td className="p-2">{o.orderStatus}</td>
                  <td className="p-2"><a href={`/dashboard/orders/${o.id}`} className="text-blue-600">View</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
