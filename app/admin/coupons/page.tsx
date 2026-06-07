"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchCurrentUser } from '@/lib/auth/client'

export default function AdminCouponsPage(){
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [coupons, setCoupons] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    fetchCurrentUser().then(async (u:any)=>{
      if(!u){ router.push('/login'); return }
      if(u.role !== 'ADMIN'){ router.push('/dashboard'); return }
      try{
        const token = localStorage.getItem('chrono_token')
        const headers: Record<string,string> = {}
        if(token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch('/api/admin/coupons', { headers, credentials: 'include' })
        const d = await res.json()
        if(!res.ok || !d?.ok) { setError(d?.message || 'Failed'); setLoading(false); return }
        setCoupons(d.coupons)
      }catch(err:any){ setError(err?.message || 'Failed') }
      setLoading(false)
    })
  },[])

  async function del(id:number){
    if(!confirm('Delete this coupon?')) return
    try{
      const token = localStorage.getItem('chrono_token')
      const headers: Record<string,string> = {}
      if(token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE', headers, credentials: 'include' })
      const d = await res.json()
      if(!res.ok || !d?.ok) { alert(d?.message || 'Failed') ; return }
      setCoupons(coupons.filter(c=> c.id !== id))
    }catch(err:any){ alert(err?.message || 'Failed') }
  }

  if(loading) return <div className="container py-12">Loading...</div>

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif">Coupons</h1>
        <Link href="/admin/coupons/new" className="px-3 py-2 bg-gold text-white rounded">New Coupon</Link>
      </div>
      {error && <div className="text-red-600 mt-4">{error}</div>}
      <div className="mt-6 overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Type</th>
              <th className="p-3">Value</th>
              <th className="p-3">Min Order</th>
              <th className="p-3">Usage</th>
              <th className="p-3">Used</th>
              <th className="p-3">Expires</th>
              <th className="p-3">Active</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c=> (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.code}</td>
                <td className="p-3">{c.discountType}</td>
                <td className="p-3">{c.discountValue}{c.discountType === 'PERCENTAGE' ? '%' : ' (cents)'}</td>
                <td className="p-3">{c.minimumOrderAmount ? `$${(c.minimumOrderAmount/100).toFixed(2)}` : '-'}</td>
                <td className="p-3">{c.usageLimit ?? '-'}</td>
                <td className="p-3">{c.usedCount ?? 0}</td>
                <td className="p-3">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '-'}</td>
                <td className="p-3">{c.isActive ? 'Yes' : 'No'}</td>
                <td className="p-3"><a href={`/admin/coupons/${c.id}`} className="text-blue-600">Edit</a> · <button onClick={()=>del(c.id)} className="text-red-600">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
