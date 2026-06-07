"use client"
import React, { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import { useRouter } from 'next/navigation'
import { getPendingEmail, clearPendingEmail, saveToken } from '@/lib/auth/client'

export default function VerifyPage(){
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const router = useRouter()
  useEffect(()=>{
    const qEmail = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('email') : null
    const p = qEmail || getPendingEmail()
    if(p) setEmail(p)
    try{
      if (process.env.NODE_ENV !== 'production'){
        const d = localStorage.getItem('chrono_dev_otp')
        if(d) setDevOtp(d)
      }
    }catch(e){}
  },[])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try{
      const res = await fetch('/api/auth/verify', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ email, code }) })
      const data = await res.json()
      if(!res.ok){ setError(data?.error || 'Verification failed'); setLoading(false); return }
      // save token and redirect
      if(data?.token){ saveToken(data.token) }
      // cleanup dev OTP and pending email
      try{ localStorage.removeItem('chrono_dev_otp') }catch(e){}
      clearPendingEmail()
      router.push('/dashboard')
    }catch(e:any){ setError(e?.message || 'Verification failed') }
    finally{ setLoading(false) }
  }

  return (
    <div className="container py-12 max-w-md">
      <h1 className="text-2xl font-serif">Verify email</h1>
      <p className="mt-2 text-sm text-slate-600">Enter the 6-digit code sent to {email || 'your email'}.</p>
      {devOtp && (
        <div className="mt-2 text-sm text-gold">Development OTP: {devOtp}</div>
      )}
      <form onSubmit={onSubmit} className="mt-6">
        {error && <div className="text-red-600">{error}</div>}
        <input value={code} onChange={e=>setCode(e.target.value)} className="w-full border rounded-md p-3 text-center text-2xl tracking-widest" maxLength={6} />
        <div className="mt-4"><Button variant="primary" type="submit">{loading ? 'Verifying...' : 'Verify'}</Button></div>
      </form>
    </div>
  )
}
