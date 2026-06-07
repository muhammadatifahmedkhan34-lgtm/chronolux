"use client"
import React, { useEffect, useState } from 'react'
import { fetchCurrentUser } from '@/lib/auth/client'

export default function Reviews({ productId }:{ productId:number }){
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [avg, setAvg] = useState<number | null>(null)
  const [count, setCount] = useState<number>(0)
  const [userReview, setUserReview] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [canReview, setCanReview] = useState<boolean | null>(null)

  const load = async ()=>{
    setLoading(true)
    try{
      const token = localStorage.getItem('chrono_token')
      const headers: Record<string,string> = {}
      if(token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/reviews/product/${productId}`, { headers, credentials: 'include' })
      const txt = await res.text(); const json = txt ? JSON.parse(txt) : null
      if(!res.ok) throw new Error(json?.message || 'Failed')
      setReviews(json.reviews || [])
      setAvg(json.averageRating)
      setCount(json.reviewCount || 0)
      setUserReview(json.userReview)
      setCanReview(json.canReview ?? null)
    }catch(err:any){ console.error(err); }
    finally{ setLoading(false) }
  }

  useEffect(()=>{
    fetchCurrentUser().then(u=>setUser(u))
    load()
  },[productId])

  async function submit(){
    setError(null)
    if(!user){ window.location.href = '/login'; return }
    if(user.role === 'ADMIN'){ setError('Admins cannot submit reviews'); return }
    setSubmitting(true)
    try{
      const token = localStorage.getItem('chrono_token')
      const headers: Record<string,string> = {'Content-Type':'application/json'}
      if(token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/reviews', { method: 'POST', headers, body: JSON.stringify({ productId, rating, comment }), credentials: 'include' })
      const txt = await res.text(); const json = txt ? JSON.parse(txt) : null
      if(!res.ok) { setError(json?.message || 'Failed'); setSubmitting(false); return }
      setUserReview(json.review)
      // reload list (approved ones won't include new unapproved review)
      load()
    }catch(err:any){ setError(err?.message || 'Failed') }
    finally{ setSubmitting(false) }
  }

  return (
    <div id="reviews" className="mt-12">
      <h2 className="text-xl font-serif">Reviews</h2>
      <div className="mt-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-semibold">{avg ? avg.toFixed(1) : '—'}</div>
          <div className="text-sm text-slate-600">{count} reviews</div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {reviews.map(r=> (
          <div key={r.id} className="p-4 bg-white rounded shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{r.user?.name || r.user?.email}</div>
                <div className="text-sm text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-yellow-500 font-semibold">{Array.from({length: r.rating}).map((_,i)=>(<span key={i}>★</span>))}</div>
            </div>
            <div className="mt-2 text-slate-700">{r.body}</div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="font-semibold">Leave a review</h3>
        {userReview ? (
          <div className="mt-3 text-slate-600">You have already reviewed this product.</div>
        ) : (
          <div className="mt-3">
            {!user ? (
              <div className="text-slate-600">Please <a href="/login" className="text-blue-600">log in</a> to leave a review.</div>
            ) : user && canReview === false ? (
              <div className="text-slate-600">Only verified buyers can review this watch.</div>
            ) : (
              <div className="bg-white p-4 rounded shadow">
                <div className="mb-2">Rating</div>
                <div className="flex gap-2 mb-3">
                  {[1,2,3,4,5].map(n=> (
                    <button key={n} type="button" onClick={()=>setRating(n)} className={`px-3 py-1 border rounded ${rating===n? 'bg-dark-brown text-white':'bg-white'}`}>{n} ★</button>
                  ))}
                </div>
                <textarea placeholder="Write your review" value={comment} onChange={e=>setComment(e.target.value)} className="w-full border p-2 rounded h-28"></textarea>
                {error && <div className="text-red-600 mt-2">{error}</div>}
                <div className="mt-3 text-right">
                  <button disabled={submitting} onClick={submit} className="px-4 py-2 bg-dark-brown text-white rounded">{submitting? 'Submitting...' : 'Submit Review'}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
