"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditProductPage({ params }: any){
  const { id } = params
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [files, setFiles] = useState<FileList | null>(null)
  const [replaceImages, setReplaceImages] = useState(false)
  const [brands, setBrands] = useState<Array<any>>([])
  const [categories, setCategories] = useState<Array<any>>([])
  const [brandId, setBrandId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const router = useRouter()

  useEffect(()=>{
    ;(async()=>{
      try{
        const res = await fetch(`/api/admin/products/${id}`, { credentials: 'include' })
        const text = await res.text()
        let json: any = null
        try{ json = text ? JSON.parse(text) : null }catch(err){ console.error('Non-JSON response:', text); throw new Error('Server returned non-JSON response') }
        if(!res.ok) { throw new Error(json?.message || 'Could not load') }
        setData(json.product)
        setBrandId(json.product.brandId ? String(json.product.brandId) : '')
        setCategoryId(json.product.categoryId ? String(json.product.categoryId) : '')
        // load brands/categories
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
      }catch(err:any){ alert(err?.message || 'Could not load') }
      finally{ setLoading(false) }
    })()
  },[id])

  const onSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try{
      const fd = new FormData()
      fd.append('title', e.target.title.value)
      fd.append('slug', e.target.slug.value)
      fd.append('price', String(Math.round(parseFloat(e.target.price.value) * 100)))
      fd.append('stock', e.target.stock.value)
      fd.append('replaceImages', replaceImages ? '1' : '0')
      if(files){ for (const f of Array.from(files)) fd.append('images', f) }
      if(brandId) fd.append('brandId', brandId)
      if(categoryId) fd.append('categoryId', categoryId)

      try{
        const res = await fetch(`/api/admin/products/${id}`, { method: 'PATCH', body: fd, credentials: 'include' })
        const text = await res.text()
        let json: any = null
        try{ json = text ? JSON.parse(text) : null }catch(err){ console.error('Non-JSON response:', text); throw new Error('Server returned non-JSON response') }
        if(!res.ok) throw new Error(json?.message || 'Update failed')
        router.push('/admin/products')
      }catch(err:any){ alert(err?.message || 'Update failed') }
      finally{ setLoading(false) }
    }catch(err:any){ alert(err?.message || 'Update failed'); setLoading(false) }
  }

  if(loading) return <div className="container py-8">Loading...</div>

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-serif">Edit Product</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-600">Title</label>
          <input name="title" defaultValue={data.title} className="w-full border rounded-md p-2 mt-1" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Slug</label>
          <input name="slug" defaultValue={data.slug} className="w-full border rounded-md p-2 mt-1" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Price (USD)</label>
          <input name="price" defaultValue={(data.price/100).toFixed(2)} className="w-full border rounded-md p-2 mt-1" type="number" step="0.01" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Stock</label>
          <input name="stock" defaultValue={data.stock} className="w-full border rounded-md p-2 mt-1" type="number" />
        </div>

        <div>
          <label className="block text-sm text-slate-600">Existing Images</label>
          <div className="flex gap-2 mt-2">
            {data.images.map((im:any)=> (
              <img key={im.id} src={im.url} alt={im.altText || ''} className="h-20 w-20 object-cover" />
            ))}
          </div>
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
          <label className="block text-sm text-slate-600">Add Images</label>
          <input onChange={e=>setFiles(e.target.files)} className="w-full mt-1" type="file" multiple accept="image/*" />
        </div>

        <div className="flex items-center gap-2">
          <input id="replace" type="checkbox" checked={replaceImages} onChange={e=>setReplaceImages(e.target.checked)} />
          <label htmlFor="replace" className="text-sm text-slate-600">Replace existing images</label>
        </div>

        <div>
          <button className="btn btn-primary" type="submit">{loading ? 'Updating...' : 'Update Product'}</button>
        </div>
      </form>
    </div>
  )
}
