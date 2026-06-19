"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../../../components/ui/Button'
import { getPendingEmail, clearPendingEmail, savePendingEmail, saveToken } from '@/lib/auth/client'

export default function VerifyPage() {
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const qEmail = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('email') : null
    const pendingEmail = qEmail || getPendingEmail()

    if (pendingEmail) {
      setEmail(pendingEmail)
      savePendingEmail(pendingEmail)
    }

    try {
      if (process.env.NODE_ENV !== 'production') {
        const storedDevOtp = localStorage.getItem('chrono_dev_otp')
        if (storedDevOtp) setDevOtp(storedDevOtp)
      }
    } catch {
      // ignore localStorage errors
    }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Verification failed')
        setLoading(false)
        return
      }

      if (data?.token) saveToken(data.token)

      try {
        localStorage.removeItem('chrono_dev_otp')
      } catch {
        // ignore localStorage errors
      }

      clearPendingEmail()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setResending(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.emailError || data?.error || 'Could not resend OTP')
        setResending(false)
        return
      }

      savePendingEmail(data?.email || email)
      setMessage(data?.message || 'A new OTP has been sent.')

      try {
        if (data?.devOtp) {
          localStorage.setItem('chrono_dev_otp', data.devOtp)
          setDevOtp(data.devOtp)
        }
      } catch {
        // ignore localStorage errors
      }
    } catch (err: any) {
      setError(err?.message || 'Could not resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="container py-12 max-w-md">
      <h1 className="text-2xl font-serif">Verify email</h1>
      <p className="mt-2 text-sm text-slate-600">Enter the 6-digit code sent to your email.</p>

      {devOtp && <div className="mt-2 text-sm text-gold">Development OTP: {devOtp}</div>}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && <div className="text-red-600">{error}</div>}
        {message && <div className="text-green-700">{message}</div>}

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
          <label className="block text-sm text-slate-600">OTP code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full border rounded-md p-3 text-center text-2xl tracking-widest mt-1"
            maxLength={6}
            inputMode="numeric"
            required
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={resendOtp}
            disabled={resending || !email}
            className="text-sm text-slate-600 underline disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </form>
    </div>
  )
}
