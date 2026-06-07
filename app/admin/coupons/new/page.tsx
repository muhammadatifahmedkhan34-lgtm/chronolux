"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { couponCreateSchema } from '@/lib/validations'

export default function NewCoupon(){
  const router = useRouter()
  const [form, setForm] = useState<any>({ code:'', discountType: 'PERCENTAGE', discountValue: 10, minimumOrderAmount: 0, usageLimit: null, expiresAt: '', isActive: true })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function submit(){
    setError(null); setSaving(true)
    try{
      const parsed = couponCreateSchema.safeParse({ ...form, discountValue: Number(form.discountValue), minimumOrderAmount: form.minimumOrderAmount ? Number(form.minimumOrderAmount) : undefined, usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined })
      if(!parsed.success){ setError('Invalid input'); setSaving(false); return }
      const token = localStorage.getItem('chrono_token')
      const headers: Record<string,string> = {'Content-Type':'application/json'}
      if(token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/admin/coupons', { method: 'POST', headers, body: JSON.stringify(parsed.data), credentials: 'include' })
      const d = await res.json()
      if(!res.ok || !d?.ok) { setError(d?.message || 'Failed'); setSaving(false); return }
      router.push('/admin/coupons')
    }catch(err:any){ setError(err?.message || 'Failed') }
    finally{ setSaving(false) }
  }

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-serif">New Coupon</h1>
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
        <input placeholder="Minimum order amount (cents)" value={form.minimumOrderAmount} onChange={e=>setForm({...form, minimumOrderAmount: e.target.value})} className="w-full border p-2 rounded mt-2" />
        <input placeholder="Usage limit" value={form.usageLimit ?? ''} onChange={e=>setForm({...form, usageLimit: e.target.value})} className="w-full border p-2 rounded mt-2" />
        <input placeholder="Expires at (ISO)" value={form.expiresAt} onChange={e=>setForm({...form, expiresAt: e.target.value})} className="w-full border p-2 rounded mt-2" />
        <div className="mt-3">
          <label><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form, isActive: e.target.checked})} /> Active</label>
        </div>
        <div className="mt-3">
          <Button onClick={submit} className="px-4 py-2" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Create'}</Button>
        </div>
      </div>
    </div>
  )
}
