import React from 'react'
import Button from '../../../components/ui/Button'

export default function LoginPage(){
  return (
    <div className="container py-12 max-w-lg">
      <h1 className="text-2xl font-serif">Login</h1>
      <form className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-600">Email</label>
          <input className="w-full border rounded-md p-2 mt-1" type="email" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Password</label>
          <input className="w-full border rounded-md p-2 mt-1" type="password" />
        </div>
        <div className="flex items-center justify-between">
          <a href="#" className="text-sm text-slate-600">Forgot password?</a>
          <Button variant="primary">Sign in</Button>
        </div>
      </form>
    </div>
  )
}
