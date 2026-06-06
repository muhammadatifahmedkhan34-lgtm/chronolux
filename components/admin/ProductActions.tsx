"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  productId: number | string
  editHref: string
  productTitle?: string
}

export default function ProductActions({ productId, editHref, productTitle }: Props){
  const router = useRouter()

  const handleDelete = async () => {
    if(!confirm(`Delete product "${productTitle || productId}"?`)) return
    try{
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE', credentials: 'include' })
      const text = await res.text()
      let data: any = null
      try{ data = text ? JSON.parse(text) : null }catch(err){ console.error('Non-JSON response:', text); throw new Error('Server returned non-JSON response') }
      if(!res.ok) throw new Error(data?.message || 'Delete failed')
      router.refresh()
    }catch(err:any){
      alert(err?.message || 'Delete failed')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a href={editHref} className="text-blue-600">Edit</a>
      <button type="button" onClick={handleDelete} className="text-red-600">Delete</button>
    </div>
  )
}
