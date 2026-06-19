"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Button from '../../../components/ui/Button'

type ApiResponse = {
  ok?: boolean
  message?: string
  error?: string
  emailError?: string
  devResetUrl?: string
}

async function readApiResponse(res: Response): Promise<ApiResponse> {
  const text = await res.text()

  if (!text) {
    return {
      error: `Empty response from server. Status: ${res.status}`,
    }
  }

  try {
    return JSON.parse(text) as ApiResponse
  } catch {
    return {
      error: `Server returned a non-JSON response. Status: ${res.status}. Check terminal logs for /api/auth/forgot-password.`,
    }
  }
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    setDevResetUrl(null)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await readApiResponse(res)

      if (!res.ok) {
        setError(data.emailError || data.error || 'Could not send reset email')
        return
      }

      setMessage(data.message || 'If an account exists with this email, a password reset link has been sent.')

      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-12 max-w-lg">
      <h1 className="text-2xl font-serif">Forgot password</h1>

      <p className="mt-2 text-sm text-slate-600">
        Enter your account email. We will send you a password reset link.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="text-green-700">
            {message}
          </div>
        )}

        {devResetUrl && (
          <div className="text-sm text-gold break-all">
            Development reset link:{' '}
            <a href={devResetUrl} className="underline">
              {devResetUrl}
            </a>
          </div>
        )}

        <div>
          <label className="block text-sm text-slate-600">
            Email
          </label>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md p-2 mt-1"
            type="email"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <Link href="/login" className="text-sm text-slate-600 underline">
            Back to login
          </Link>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
        </div>
      </form>
    </div>
  )
}