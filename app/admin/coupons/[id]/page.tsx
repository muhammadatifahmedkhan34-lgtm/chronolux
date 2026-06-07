"use client"
import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { couponCreateSchema } from '@/lib/validations'

export default function EditCoupon(){
  const router = useRouter()
  const params = useParams()
  const id = params?.id
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    if(!id) return
    (async ()=>{
      setLoading(true)
      try{
        const token = localStorage.getItem('chrono_token')
        const headers: Record<string,string> = {}
        if(token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch(`/api/admin/coupons/${id}`, { headers, credentials: 'include' })
        const d = await res.json()
        if(!res.ok || !d?.ok){ setError(d?.message || 'Failed'); setLoading(false); return }
        setForm(d.coupon)
      }catch(err:any){ setError(err?.message || 'Failed') }
      setLoading(false)
    })()
  },[id])

  async function save(){
    setError(null)
    try{
      const parsed = couponCreateSchema.safeParse({ ...form, discountValue: Number(form.discountValue), minimumOrderAmount: form.minimumOrderAmount ? Number(form.minimumOrderAmount) : undefined, usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined })
      if(!parsed.success){ setError('Invalid input'); return }
      const token = localStorage.getItem('chrono_token')
      const headers: Record<string,string> = {'Content-Type':'application/json'}
      if(token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'PATCH', headers, body: JSON.stringify(parsed.data), credentials: 'include' })
      const d = await res.json()
      if(!res.ok || !d?.ok) { setError(d?.message || 'Failed'); return }
      router.push('/admin/coupons')
    }catch(err:any){ setError(err?.message || 'Failed') }
  }

  if(loading) return <div className="container py-12">Loading...</div>
  if(!form) return <div className="container py-12">{error ?? 'Not found'}</div>

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-serif">Edit Coupon</h1>
      {error && <div className="text-red-600 mt-3">{error}</div>}
      <div className="mt-4 bg-white p-4 rounded shadow max-w-xl">
        <input placeholder="Code" value={form.code} onChange={e=>setForm({...form, code: e.target.value})} className="w-full border p-2 rounded mb-2" />
        <div className="flex gap-2">
          <select value={form.discountType} onChange={e=>setForm({...form, discountType: e.target.value})} className="border p-2 rounded">
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed (cents)</option>
          </select>
          <input placeholder="Value" value={form.discountValue} onChange={e=>setForm({...form, discountValue: e.target.value})} className="border p-2 rounded" />
        </div>
        <input placeholder="Minimum order amount (cents)" value={form.minimumOrderAmount ?? ''} onChange={e=>setForm({...form, minimumOrderAmount: e.target.value})} className="w-full border p-2 rounded mt-2" />
        <input placeholder="Usage limit" value={form.usageLimit ?? ''} onChange={e=>setForm({...form, usageLimit: e.target.value})} className="w-full border p-2 rounded mt-2" />
        <input placeholder="Expires at (ISO)" value={form.expiresAt ?? ''} onChange={e=>setForm({...form, expiresAt: e.target.value})} className="w-full border p-2 rounded mt-2" />
        <div className="mt-3">
          <label><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form, isActive: e.target.checked})} /> Active</label>
        </div>
        <div className="mt-3">
          <button onClick={save} className="px-4 py-2 bg-gold text-white rounded">Save</button>
        </div>
      </div>
    </div>
  )
}
