"use client"
import React, { useEffect, useState } from 'react'
import CartItemRow from '@/components/cart/CartItemRow'

export default function CartPage(){
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async ()=>{
    setLoading(true)
    try{
      const res = await fetch('/api/cart', { credentials: 'include' })
      const text = await res.text(); const json = text ? JSON.parse(text) : null
      if(!res.ok){ if(res.status === 401) return window.location.href = '/login'; throw new Error(json?.message || 'Failed') }
      setItems(json.items || [])
    }catch(err:any){ alert(err?.message || 'Failed to load cart') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  const handleUpdated = (updated:any) => {
    setItems(prev => prev.map(i => i.id === updated.id ? { ...i, quantity: updated.quantity } : i))
  }
  const handleRemoved = (id:number) => setItems(prev => prev.filter(i=> i.id !== id))

  const subtotal = items.reduce((s, it) => s + (it.product.price * it.quantity), 0)

  if(loading) return <div className="container py-8">Loading...</div>

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-serif">Your Cart</h1>
      {items.length === 0 ? (
        <div className="mt-6 p-8 text-center text-slate-600">Your cart is empty.</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4">
          {items.map(it => <CartItemRow key={it.id} item={it} onUpdated={handleUpdated} onRemoved={handleRemoved} />)}
          <div className="text-right mt-4">
            <div className="font-semibold text-lg">Subtotal: ${(subtotal/100).toFixed(2)}</div>
            <div className="text-sm text-slate-600">Checkout coming next</div>
          </div>
        </div>
      )}
    </div>
  )
}
