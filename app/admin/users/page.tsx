"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchCurrentUser } from '@/lib/auth/client'

export default function AdminUsersPage(){
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    fetchCurrentUser().then(async (u:any)=>{
      if(!u){ router.push('/login'); return }
      if(u.role !== 'ADMIN'){ router.push('/dashboard'); return }
      setUser(u)
      try{
        const token = localStorage.getItem('chrono_token')
        const headers: Record<string,string> = {}
        if(token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch('/api/admin/users', { headers, credentials: 'include' })
        const data = await res.json()
        if(!res.ok || !data?.ok) { setError(data?.message || 'Failed to load users') }
        else setUsers(data.users)
      }catch(err:any){ setError(err?.message || 'Failed to load users') }
      setLoading(false)
    })
  },[])

  async function performAction(uid:number, action:string){
    if(!confirm(`Are you sure you want to ${action} this user?`)) return
    try{
      const token = localStorage.getItem('chrono_token')
      const headers: Record<string,string> = {'Content-Type':'application/json'}
      if(token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/admin/users/${uid}`, { method: 'PATCH', headers, body: JSON.stringify({ action }) })
      const data = await res.json()
      if(!res.ok || !data?.ok) { alert(data?.message || 'Failed'); return }
      setUsers(users.map(u=> u.id === uid ? data.user : u))
    }catch(err:any){ alert(err?.message || 'Failed') }
  }

  if(loading) return <div className="container py-12">Loading users...</div>

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif">Users</h1>
        <button onClick={()=>router.push('/admin')} className="text-sm text-slate-600">Back to dashboard</button>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      <div className="mt-6 overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Verified</th>
              <th className="p-3">Blocked</th>
              <th className="p-3">Removed</th>
              <th className="p-3">Created</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Total Spent</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u=> (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name || '-'}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.isVerified ? <span className="text-green-600">Verified</span> : <span className="text-slate-500">Unverified</span>}</td>
                <td className="p-3">{u.isBlocked ? <span className="text-red-600">Blocked</span> : <span className="text-green-600">Active</span>}</td>
                <td className="p-3">{u.isRemoved ? <span className="text-red-600">Removed</span> : <span className="text-green-600">Active</span>}</td>
                <td className="p-3">{new Date(u.createdAt).toLocaleString()}</td>
                <td className="p-3">{u.totalOrders}</td>
                <td className="p-3">${((u.totalSpent ?? 0)/100).toFixed(2)}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={()=>router.push(`/admin/users/${u.id}`)} className="text-blue-600">View</button>
                    {u.isBlocked ? <button onClick={()=>performAction(u.id,'unblock')} className="text-green-600">Unblock</button> : <button onClick={()=>performAction(u.id,'block')} className="text-red-600">Block</button>}
                    {u.isRemoved ? <button onClick={()=>performAction(u.id,'restore')} className="text-green-600">Restore</button> : <button onClick={()=>performAction(u.id,'remove')} className="text-red-600">Remove</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
