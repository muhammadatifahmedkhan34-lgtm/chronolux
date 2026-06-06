"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProductPage(){
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [price, setPrice] = useState('0')
  const [stock, setStock] = useState('0')
  const [files, setFiles] = useState<FileList | null>(null)
  const [brands, setBrands] = useState<Array<any>>([])
  const [categories, setCategories] = useState<Array<any>>([])
  const [brandId, setBrandId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(()=>{
    ;(async()=>{
      try{
        const b = await fetch('/api/admin/brands', { credentials: 'include' })
        const bt = await b.text()
        const bjson = bt ? JSON.parse(bt) : null
        if(b.ok) setBrands(bjson.brands || [])
      }catch(err){ console.error('Failed to load brands', err) }

      try{
        const c = await fetch('/api/admin/categories', { credentials: 'include' })
        const ct = await c.text()
        const cjson = ct ? JSON.parse(ct) : null
        if(c.ok) setCategories(cjson.categories || [])
      }catch(err){ console.error('Failed to load categories', err) }
    })()
  },[])

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
      if(brandId) fd.append('brandId', brandId)
      if(categoryId) fd.append('categoryId', categoryId)
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
          <label className="block text-sm text-slate-600">Brand</label>
          <select value={brandId} onChange={e=>setBrandId(e.target.value)} className="w-full border rounded-md p-2 mt-1">
            <option value="">—</option>
            {brands.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-600">Category</label>
          <select value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="w-full border rounded-md p-2 mt-1">
            <option value="">—</option>
            {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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
