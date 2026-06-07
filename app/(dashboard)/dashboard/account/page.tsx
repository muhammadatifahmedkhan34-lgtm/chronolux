"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchCurrentUser } from '@/lib/auth/client'

export default function AccountPage(){
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(()=>{
    ;(async()=>{
      const u = await fetchCurrentUser()
      if(!u) return router.push('/login')
      if(u.role === 'ADMIN') return router.push('/admin')
      setUser(u)
      setLoading(false)
    })()
  },[])

  if(loading) return <div className="container py-12">Loading...</div>

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-serif">Account</h1>
      <div className="mt-6 bg-white border rounded p-6 shadow">
        <div className="mb-3"><strong>Name:</strong> {user?.name || '—'}</div>
        <div className="mb-3"><strong>Email:</strong> {user?.email}</div>
        <div className="mb-3"><strong>Verified:</strong> {user?.isVerified ? 'Yes' : 'No'}</div>
        <div className="mt-4 text-slate-600">Account editing will be added later.</div>
      </div>
    </div>
  )
}
