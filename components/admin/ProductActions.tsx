"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  productId: number | string
  editHref: string
  productTitle?: string
  isPublished?: boolean
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
      {/** Publish/unpublish quick toggle */}
      <PublishToggle productId={productId} router={router} />
      <button type="button" onClick={handleDelete} className="text-red-600">Delete</button>
    </div>
  )
}

function PublishToggle({ productId, router }: any){
  const [loading, setLoading] = React.useState(false)
  const [published, setPublished] = React.useState<boolean | null>(null)

  React.useEffect(()=>{
    let mounted = true
    ;(async()=>{
      try{
        const res = await fetch(`/api/admin/products/${productId}`, { credentials: 'include' })
        const text = await res.text()
        const json = text ? JSON.parse(text) : null
        if(res.ok && mounted) setPublished(!!json.product?.isPublished)
      }catch(err){ }
    })()
    return ()=>{ mounted = false }
  },[productId])

  if(published === null) return null

  const toggle = async ()=>{
    if(!confirm(`Set published=${!published} for product ${productId}?`)) return
    setLoading(true)
    try{
      const fd = new FormData()
      fd.append('action', 'publish')
      fd.append('isPublished', !published ? '1' : '0')
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'PATCH', body: fd, credentials: 'include' })
      const text = await res.text()
      const json = text ? JSON.parse(text) : null
      if(!res.ok) throw new Error(json?.message || 'Failed')
      setPublished(!published)
      router.refresh()
    }catch(err:any){ alert(err?.message || 'Publish toggle failed') }
    finally{ setLoading(false) }
  }

  return (
    <button onClick={toggle} className={`px-2 py-1 text-sm rounded ${published ? 'bg-gold text-white' : 'bg-slate-100 text-slate-700'}`} disabled={loading}>
      {published ? 'Unpublish' : 'Publish'}
    </button>
  )
}
