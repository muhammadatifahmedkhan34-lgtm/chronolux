"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '../../../components/ui/Button'
import { savePendingEmail, saveToken, fetchCurrentUser } from '@/lib/auth/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data?.requiresVerification && data?.email) {
          savePendingEmail(data.email)
          router.push('/verify')
          return
        }

        setError(data?.error || 'Login failed')
        setLoading(false)
        return
      }

      if (!data?.token) {
        setError('No token returned')
        setLoading(false)
        return
      }

      saveToken(data.token)

      const role = data.user?.role

      if (role === 'ADMIN') {
        window.location.href = '/admin'
        return
      }

      if (role === 'CUSTOMER') {
        window.location.href = '/dashboard'
        return
      }

      const user = await fetchCurrentUser()
      if (user?.role === 'ADMIN') {
        window.location.href = '/admin'
        return
      }
      if (user?.role === 'CUSTOMER') {
        window.location.href = '/dashboard'
        return
      }

      setError('Invalid user role')
      setLoading(false)
    } catch (err: any) {
      console.error('Login error', err)
      setError(err?.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="container py-12 max-w-lg">
      <h1 className="text-2xl font-serif">Login</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && <div className="text-red-600">{error}</div>}
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
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <Link href="/forgot-password" className="text-sm text-slate-600 underline">
            Forgot password?
          </Link>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      </form>
    </div>
  )
}
