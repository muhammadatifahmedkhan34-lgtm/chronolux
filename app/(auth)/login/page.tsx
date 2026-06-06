"use client"
import React, { useState } from 'react'
import Button from '../../../components/ui/Button'
import { useRouter } from 'next/navigation'
import { saveToken, fetchCurrentUser } from '@/lib/auth/client'

export default function LoginPage(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try{
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if(!res.ok){ setError(data?.error || 'Login failed'); setLoading(false); return }
      if(data?.token){
        saveToken(data.token)
        // fetch user to detect role
        const user = await fetchCurrentUser()
        if(user?.role === 'ADMIN') router.push('/admin')
        else router.push('/dashboard')
      }else{
        setError('No token returned')
      }
    }catch(e:any){ setError(e?.message || 'Login failed') }
    finally{ setLoading(false) }
  }

  return (
    <div className="container py-12 max-w-lg">
      <h1 className="text-2xl font-serif">Login</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <label className="block text-sm text-slate-600">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-md p-2 mt-1" type="email" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-md p-2 mt-1" type="password" />
        </div>
        <div className="flex items-center justify-between">
          <a href="#" className="text-sm text-slate-600">Forgot password?</a>
          <Button variant="primary" type="submit">{loading ? 'Signing in...' : 'Sign in'}</Button>
        </div>
      </form>
    </div>
  )
}
