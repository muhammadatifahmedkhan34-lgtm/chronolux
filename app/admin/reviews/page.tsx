"use client"
import React, { useEffect, useState } from 'react'
import { fetchCurrentUser } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'

export default function AdminReviewsPage(){
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    fetchCurrentUser().then(async (u:any)=>{
      if(!u){ router.push('/login'); return }
      if(u.role !== 'ADMIN'){ router.push('/dashboard'); return }
      try{
        const token = localStorage.getItem('chrono_token')
        const headers: Record<string,string> = {}
        if(token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch('/api/admin/reviews', { headers, credentials: 'include' })
        const d = await res.json()
        if(!res.ok || !d?.ok){ setError(d?.message || 'Failed'); setLoading(false); return }
        setReviews(d.reviews)
      }catch(err:any){ setError(err?.message || 'Failed') }
      setLoading(false)
    })
  },[])

  async function doAction(id:number, action:string){
    if(!confirm(`Confirm ${action}?`)) return
    try{
      const token = localStorage.getItem('chrono_token')
      const headers: Record<string,string> = {'Content-Type':'application/json'}
      if(token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ action }), credentials: 'include' })
      const d = await res.json()
      if(!res.ok || !d?.ok){ alert(d?.message || 'Failed'); return }
      setReviews(reviews.map(r=> r.id === id ? d.review : r))
    }catch(err:any){ alert(err?.message || 'Failed') }
  }

  async function del(id:number){ if(!confirm('Delete review?')) return; try{ const token = localStorage.getItem('chrono_token'); const headers: Record<string,string> = {}; if(token) headers['Authorization'] = `Bearer ${token}`; const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE', headers, credentials: 'include' }); const d = await res.json(); if(!res.ok || !d?.ok){ alert(d?.message || 'Failed'); return } setReviews(reviews.filter(r=> r.id !== id)) }catch(err:any){ alert(err?.message || 'Failed') }
  }

  if(loading) return <div className="container py-12">Loading...</div>

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-serif">Reviews</h1>
      {error && <div className="text-red-600 mt-3">{error}</div>}
      <div className="mt-6 overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Comment</th>
              <th className="p-3">Approved</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r=> (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.product?.title}</td>
                <td className="p-3">{r.user?.email || r.user?.name}</td>
                <td className="p-3">{r.rating}</td>
                <td className="p-3">{r.body}</td>
                <td className="p-3">{r.approved ? 'Yes' : 'No'}</td>
                <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-3">
                  {r.approved ? <button onClick={()=>doAction(r.id,'unapprove')} className="text-sm text-yellow-600">Unapprove</button> : <button onClick={()=>doAction(r.id,'approve')} className="text-sm text-green-600">Approve</button>} · <button onClick={()=>del(r.id)} className="text-sm text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
