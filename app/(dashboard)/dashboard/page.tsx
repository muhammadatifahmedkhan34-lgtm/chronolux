"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchCurrentUser } from '@/lib/auth/client'

export default function DashboardIndex(){
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(()=>{
    fetchCurrentUser().then(u=>{
      if(!u){ router.push('/login'); return }
      if(u.role === 'ADMIN'){ router.push('/admin'); return }
      setUser(u)
      setLoading(false)
    })
  },[])

  if(loading) return <div className="container py-12">Loading...</div>

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-serif">Welcome, {user?.name || user?.email}</h1>
      <p className="mt-4">This is your dashboard.</p>
    </div>
  )
}
