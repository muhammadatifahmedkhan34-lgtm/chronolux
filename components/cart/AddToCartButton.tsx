"use client"
import React, { useState } from 'react'

export default function AddToCartButton({ productId, max = 0 }: { productId: number, max?: number }){
  const [loading, setLoading] = useState(false)

  const add = async () => {
    setLoading(true)
    try{
      const res = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity: 1 }), credentials: 'include' })
      const text = await res.text()
      const json = text ? JSON.parse(text) : null
      if(!res.ok){
        if(res.status === 401) return window.location.href = '/login'
        throw new Error(json?.message || 'Failed to add to cart')
      }
      // simple UX: go to cart
      window.location.href = '/cart'
    }catch(err:any){
      alert(err?.message || 'Add to cart failed')
    }finally{ setLoading(false) }
  }

  return (
    <button onClick={add} disabled={loading || (max === 0)} className={`px-3 py-2 rounded ${max===0 ? 'bg-slate-200 text-slate-500' : 'bg-dark-brown text-white'}`}>
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}
