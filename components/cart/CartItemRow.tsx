"use client"
import React, { useState } from 'react'

export default function CartItemRow({ item, onUpdated, onRemoved }: any){
  const [qty, setQty] = useState(item.quantity)
  const [loading, setLoading] = useState(false)

  const update = async (newQty:number) => {
    if(newQty < 1) return
    if(newQty > item.product.stock) { alert('Exceeds stock'); return }
    setLoading(true)
    try{
      const res = await fetch(`/api/cart/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: newQty }), credentials: 'include' })
      const text = await res.text(); const json = text ? JSON.parse(text) : null
      if(!res.ok){ if(res.status === 401) return window.location.href = '/login'; throw new Error(json?.message || 'Update failed') }
      setQty(newQty)
      onUpdated && onUpdated(json.item)
    }catch(err:any){ alert(err?.message || 'Update failed') }
    finally{ setLoading(false) }
  }

  const remove = async () => {
    if(!confirm('Remove this item?')) return
    setLoading(true)
    try{
      const res = await fetch(`/api/cart/${item.id}`, { method: 'DELETE', credentials: 'include' })
      const text = await res.text(); const json = text ? JSON.parse(text) : null
      if(!res.ok){ if(res.status === 401) return window.location.href = '/login'; throw new Error(json?.message || 'Remove failed') }
      onRemoved && onRemoved(item.id)
    }catch(err:any){ alert(err?.message || 'Remove failed') }
    finally{ setLoading(false) }
  }

  return (
    <div className="flex items-center gap-4 border-b py-4">
      <img src={item.product.images[0]?.url} alt={item.product.title} className="w-20 h-20 object-cover rounded" />
      <div className="flex-1">
        <div className="font-medium">{item.product.title}</div>
        <div className="text-sm text-slate-600">{item.product.brand?.name}</div>
        <div className="mt-2 flex items-center gap-2">
          <button onClick={()=>update(qty-1)} disabled={loading || qty<=1} className="px-2 py-1 border">-</button>
          <div className="px-3">{qty}</div>
          <button onClick={()=>update(qty+1)} disabled={loading || qty>=item.product.stock} className="px-2 py-1 border">+</button>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold">${(item.product.price/100).toFixed(2)}</div>
        <div className="text-sm text-slate-600">${((item.product.price * qty)/100).toFixed(2)}</div>
        <div className="mt-2">
          <button onClick={remove} className="text-red-600">Remove</button>
        </div>
      </div>
    </div>
  )
}
