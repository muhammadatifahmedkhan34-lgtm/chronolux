"use client"
import React, { useEffect, useState } from 'react'

export default function WishlistPage(){
  const [wishlist, setWishlist] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async ()=>{
    setLoading(true)
    try{
      const res = await fetch('/api/wishlist', { credentials: 'include' })
      const text = await res.text(); const json = text ? JSON.parse(text) : null
      if(!res.ok){ if(res.status === 401) return window.location.href = '/login'; throw new Error(json?.message || 'Failed') }
      setWishlist(json.wishlist)
    }catch(err:any){ alert(err?.message || 'Failed to load wishlist') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  if(loading) return <div className="container py-8">Loading...</div>

  const items = wishlist?.products || []

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-serif">Your Wishlist</h1>
      {items.length === 0 ? (
        <div className="mt-6 p-8 text-center text-slate-600">Your wishlist is empty.</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p:any)=> (
            <div key={p.id} className="border rounded p-4 bg-white">
              <img src={p.images[0]?.url} className="w-full h-48 object-cover rounded" />
              <div className="mt-2 font-medium">{p.title}</div>
              <div className="text-sm text-slate-600">{p.brand?.name}</div>
              <div className="mt-2">${(p.price/100).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
