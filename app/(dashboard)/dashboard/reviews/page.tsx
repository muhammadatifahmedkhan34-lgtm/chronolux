"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchCurrentUser } from '@/lib/auth/client'

export default function MyReviewsPage(){
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [pending, setPending] = useState<any[]>([])

  useEffect(()=>{
    ;(async()=>{
      const u = await fetchCurrentUser()
      if(!u) return router.push('/login')
      if(u.role === 'ADMIN') return router.push('/admin')
      try{
        const res = await fetch('/api/dashboard/reviews', { credentials: 'include' })
        const text = await res.text(); const json = text ? JSON.parse(text) : null
        if(!res.ok) { if(res.status === 401) return router.push('/login'); throw new Error(json?.message || 'Failed') }
        setReviews(json.reviews || [])
        // fetch reviewable products
        const r2 = await fetch('/api/dashboard/reviewable-products', { credentials: 'include' })
        const t2 = await r2.text(); const j2 = t2 ? JSON.parse(t2) : null
        if(r2.ok) setPending(j2.products || [])
      }catch(err:any){ alert(err?.message || 'Failed to load reviews') }
      finally{ setLoading(false) }
    })()
  },[])

  if(loading) return <div className="container py-12">Loading...</div>

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-serif">My Reviews</h1>
      {reviews.length === 0 ? (
        <div className="mt-6 text-slate-600">You have not submitted any reviews yet.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map(r=> (
            <div key={r.id} className="p-4 bg-white border rounded shadow flex gap-4">
              <img src={r.product?.images?.[0]?.url || '/placeholder.png'} alt={r.product?.title} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{r.product?.title}</div>
                    <div className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm">{r.approved ? 'Approved' : 'Pending'}</div>
                </div>
                <div className="mt-2">Rating: {r.rating} / 5</div>
                {r.body && <div className="mt-2 text-slate-700">{r.body}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Products awaiting your feedback</h2>
        {pending.length === 0 ? (
          <div className="mt-3 text-slate-600">You have no pending feedback requests.</div>
        ) : (
          <div className="mt-3 space-y-3">
            {pending.map(p=> (
              <div key={p.id} className="p-3 bg-white border rounded flex items-center gap-4">
                <img src={p.image || '/placeholder.png'} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-slate-500">Ordered: {new Date(p.orderDate).toLocaleDateString()}</div>
                </div>
                <a href={`/products/${p.slug}#reviews`} className="px-3 py-2 bg-dark-brown text-white rounded">Leave Review</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
