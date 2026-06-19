"use client"

import React, { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '../../../components/ui/Button'

type ApiResponse = {
  ok?: boolean
  message?: string
  error?: string
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
      error: `Server returned a non-JSON response. Status: ${res.status}. Check terminal logs for /api/auth/reset-password.`,
    }
  }
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true)
    setError(null)
    setMessage(null)

    if (!token) {
      setError('Reset token is missing. Please open the link from your email again.')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      const data = await readApiResponse(res)

      if (!res.ok) {
        setError(data.error || 'Password could not be reset.')
        return
      }

      setMessage(data.message || 'Password has been reset successfully.')

      setTimeout(() => {
        router.push('/login')
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Password could not be reset.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-12 max-w-lg">
      <h1 className="text-2xl font-serif">Reset password</h1>

      <p className="mt-2 text-sm text-slate-600">
        Enter your new password below.
      </p>

      {!token && (
        <div className="mt-6 text-red-600">
          Reset token is missing. Please open the password reset link from your email again.
        </div>
      )}

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

        <div>
          <label className="block text-sm text-slate-600">
            New password
          </label>

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md p-2 mt-1"
            type="password"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600">
            Confirm password
          </label>

          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded-md p-2 mt-1"
            type="password"
            required
            minLength={8}
          />
        </div>

        <div className="flex items-center justify-between">
          <Link href="/login" className="text-sm text-slate-600 underline">
            Back to login
          </Link>

          <Button variant="primary" type="submit" disabled={loading || !token}>
            {loading ? 'Resetting...' : 'Reset password'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="container py-12">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}