import React from 'react'
import Button from '../../../components/ui/Button'

export default function RegisterPage(){
  return (
    <div className="container py-12 max-w-lg">
      <h1 className="text-2xl font-serif">Create account</h1>
      <form className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-600">Full name</label>
          <input className="w-full border rounded-md p-2 mt-1" type="text" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Email</label>
          <input className="w-full border rounded-md p-2 mt-1" type="email" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Password</label>
          <input className="w-full border rounded-md p-2 mt-1" type="password" />
        </div>
        <Button variant="primary">Create account</Button>
      </form>
    </div>
  )
}
