"use client"
import React, { useState } from 'react'
import Button from '../../../components/ui/Button'
import { useRouter } from 'next/navigation'
import { savePendingEmail } from '@/lib/auth/client'

export default function RegisterPage(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try{
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name, email, password }) })
      const data = await res.json()
      if(!res.ok){ setError(data?.error || 'Registration failed'); setLoading(false); return }
      // save pending email and redirect to verify
      savePendingEmail(email)
      router.push('/verify')
    }catch(e:any){
      setError(e?.message || 'Registration failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="container py-12 max-w-lg">
      <h1 className="text-2xl font-serif">Create account</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <label className="block text-sm text-slate-600">Full name</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-md p-2 mt-1" type="text" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-md p-2 mt-1" type="email" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-md p-2 mt-1" type="password" />
        </div>
        <Button variant="primary" type="submit">{loading ? 'Creating...' : 'Create account'}</Button>
      </form>
    </div>
  )
}
