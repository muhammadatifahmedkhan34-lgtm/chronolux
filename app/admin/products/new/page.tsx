"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProductPage(){
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [price, setPrice] = useState('0')
  const [stock, setStock] = useState('0')
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try{
      const fd = new FormData()
      fd.append('title', title)
      fd.append('slug', slug)
      fd.append('price', String(Math.round(parseFloat(price) * 100)))
      fd.append('stock', stock)
      if(files){
        for (const f of Array.from(files)) fd.append('images', f)
      }
      const res = await fetch('/api/admin/products', { method: 'POST', body: fd, credentials: 'include' })
      const text = await res.text()
      let data: any = null
      try{
        data = text ? JSON.parse(text) : null
      }catch(err){
        console.error('Non-JSON response:', text)
        throw new Error('Server returned non-JSON response')
      }

      if(!res.ok){
        throw new Error(data?.message || data?.error || 'Failed to create product')
      }

      router.push('/admin/products')
    }catch(err:any){
      alert(err?.message || 'Create failed')
      setLoading(false)
    }finally{
      // ensure loading cleared in all cases
      setLoading(false)
    }
  }

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-serif">New Product</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-600">Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded-md p-2 mt-1" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Slug</label>
          <input value={slug} onChange={e=>setSlug(e.target.value)} className="w-full border rounded-md p-2 mt-1" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Price (USD)</label>
          <input value={price} onChange={e=>setPrice(e.target.value)} className="w-full border rounded-md p-2 mt-1" type="number" step="0.01" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Stock</label>
          <input value={stock} onChange={e=>setStock(e.target.value)} className="w-full border rounded-md p-2 mt-1" type="number" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Images</label>
          <input onChange={e=>setFiles(e.target.files)} className="w-full mt-1" type="file" multiple accept="image/*" />
        </div>
        <div>
          <button className="btn btn-primary" type="submit">{loading ? 'Creating...' : 'Create Product'}</button>
        </div>
      </form>
    </div>
  )
}
