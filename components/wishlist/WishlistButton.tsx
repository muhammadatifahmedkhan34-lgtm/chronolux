"use client"
import React, { useEffect, useState } from 'react'

export default function WishlistButton({ productId }: { productId: number }){
  const [loading, setLoading] = useState(false)
  const [inList, setInList] = useState<boolean | null>(null)

  useEffect(()=>{
    let mounted = true
    ;(async()=>{
      try{
        const res = await fetch('/api/wishlist', { credentials: 'include' })
        const text = await res.text()
        const json = text ? JSON.parse(text) : null
        if(res.ok && mounted){
          const items = json.wishlist?.products || []
          setInList(items.some((p:any)=> p.id === productId))
        }
      }catch(err){ }
    })()
    return ()=>{ mounted = false }
  },[productId])

  const toggle = async ()=>{
    setLoading(true)
    try{
      const res = await fetch('/api/wishlist/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }), credentials: 'include' })
      const text = await res.text()
      const json = text ? JSON.parse(text) : null
      if(!res.ok){ if(res.status === 401) return window.location.href = '/login'; throw new Error(json?.message || 'Failed') }
      setInList(prev => !prev)
    }catch(err:any){ alert(err?.message || 'Wishlist failed') }
    finally{ setLoading(false) }
  }

  if(inList === null) return null
  return (
    <button onClick={toggle} disabled={loading} className={`px-2 py-1 rounded text-sm ${inList ? 'bg-gold text-white' : 'border'}`}>
      {inList ? 'Wishlisted' : 'Add to Wishlist'}
    </button>
  )
}
