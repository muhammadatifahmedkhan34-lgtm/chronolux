import React from 'react'
import Button from '../../../components/ui/Button'

export default function VerifyPage(){
  return (
    <div className="container py-12 max-w-md">
      <h1 className="text-2xl font-serif">Verify email</h1>
      <p className="mt-2 text-sm text-slate-600">Enter the 6-digit code sent to your email.</p>
      <div className="mt-6">
        <input className="w-full border rounded-md p-3 text-center text-2xl tracking-widest" maxLength={6} />
        <div className="mt-4"><Button variant="primary">Verify</Button></div>
      </div>
    </div>
  )
}
