"use client"
import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { fetchCurrentUser } from '@/lib/auth/client'

export default function AdminUserDetail(){
  const router = useRouter()
  const params = useParams()
  const id = params?.id
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    fetchCurrentUser().then(async (u:any)=>{
      if(!u){ router.push('/login'); return }
      if(u.role !== 'ADMIN'){ router.push('/dashboard'); return }
      try{
        const token = localStorage.getItem('chrono_token')
        const headers: Record<string,string> = {}
        if(token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch(`/api/admin/users/${id}`, { headers, credentials: 'include' })
        const d = await res.json()
        if(!res.ok || !d?.ok){ setError(d?.message || 'Failed to load'); setLoading(false); return }
          setData(d)
      }catch(err:any){ setError(err?.message || 'Failed to load') }
      setLoading(false)
    })
  },[id])

  async function performAction(action:string){
    const confirmMessage = action === 'remove' ? 'This will permanently delete this customer account and allow the email to be registered again. Continue?' : `Are you sure you want to ${action} this user?`
    if(!confirm(confirmMessage)) return
    try{
      console.log('[ADMIN DETAIL UI] performAction userId:', id)
      const body = { action }
      console.log('[ADMIN DETAIL UI] request body:', body)
      const token = localStorage.getItem('chrono_token')
      const headers: Record<string,string> = {'Content-Type':'application/json'}
      if(token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers, body: JSON.stringify(body), credentials: 'include' })
      console.log('[ADMIN DETAIL UI] response status:', res.status)
      const d = await res.json()
      console.log('[ADMIN DETAIL UI] response json:', d)
      if(!res.ok || !d?.ok){ alert(d?.message || 'Failed'); return }
      if(action === 'remove'){
        alert('User permanently deleted')
        router.push('/admin/users')
        return
      }
      setData((prev: any) => ({ ...prev, user: d.user }))
      alert('User updated')
    }catch(err:any){ alert(err?.message || 'Failed') }
  }

  if(loading) return <div className="container py-12">Loading user...</div>
  if(!data) return <div className="container py-12">{error ?? 'User not found'}</div>

  const u = data.user

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif">User: {u.email}</h1>
        <button onClick={()=>router.push('/admin/users')} className="text-sm text-slate-600">Back to users</button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Profile</h3>
          <div className="mt-2">Name: {u.name || '-'}</div>
          <div>Email: {u.email}</div>
          <div>Role: {u.role}</div>
          <div>Status: {u.isRemoved ? 'Removed' : u.isBlocked ? 'Blocked' : 'Active'}</div>
          <div>Verified: {u.isVerified ? 'Yes' : 'No'}</div>
          <div className="mt-3 flex gap-2">
            {u.isBlocked ? <button onClick={()=>performAction('unblock')} className="text-green-600">Unblock</button> : <button onClick={()=>performAction('block')} className="text-red-600">Block</button>}
            {u.isRemoved ? <span className="text-slate-500">Removed</span> : <button onClick={()=>performAction('remove')} className="text-red-600">Delete Permanently</button>}
          </div>
        </div>

        <div className="md:col-span-2 p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Order History</h3>
          <div className="mt-3">
            {data.orders.length === 0 && <div className="text-slate-500">No orders</div>}
            {data.orders.map((o:any)=> (
              <div key={o.id} className="border-t py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{o.orderNumber}</div>
                  <div className="text-sm text-slate-500">{new Date(o.placedAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div>Total: ${(o.total/100).toFixed(2)}</div>
                  <div className="text-sm">Status: {o.orderStatus}</div>
                </div>
                <div className="ml-4"><a href={`/admin/orders/${o.id}`} className="text-blue-600">View</a></div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">Total Spent: ${((data.totalSpent ?? 0)/100).toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}
