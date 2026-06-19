"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../../../components/ui/Button'
import { savePendingEmail } from '@/lib/auth/client'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data?.email) savePendingEmail(data.email)
        setError(data?.emailError || data?.error || 'Registration failed')
        setLoading(false)
        return
      }

      const pendingEmail = data?.email || email
      savePendingEmail(pendingEmail)

      try {
        if (data?.devOtp) localStorage.setItem('chrono_dev_otp', data.devOtp)
      } catch {
        // ignore localStorage errors
      }

      if (data?.emailSkipped && data?.devOtp) {
        setInfo(`Development OTP: ${data.devOtp}`)
      }

      router.push('/verify')
    } catch (err: any) {
      setError(err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-12 max-w-lg">
      <h1 className="text-2xl font-serif">Create account</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && <div className="text-red-600">{error}</div>}
        {info && <div className="text-green-700">{info}</div>}
        <div>
          <label className="block text-sm text-slate-600">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-md p-2 mt-1"
            type="text"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md p-2 mt-1"
            type="email"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md p-2 mt-1"
            type="password"
            minLength={8}
            required
          />
        </div>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create account'}
        </Button>
      </form>
    </div>
  )
}
