"use client"
import React, { useEffect, useState } from 'react'
import { addressSchema, dummyCardSchema } from '@/lib/validations'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

export default function CheckoutPage(){
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [address, setAddress] = useState<any>({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '' })
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY'|'DUMMY_CARD'>('CASH_ON_DELIVERY')
  const [card, setCard] = useState<any>({ cardholderName: '', cardNumber: '', expiry: '', cvv: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const load = async ()=>{
    setLoading(true)
    try{
      const res = await fetch('/api/cart', { credentials: 'include' })
      const text = await res.text(); const json = text ? JSON.parse(text) : null
      if(!res.ok){ if(res.status === 401) return window.location.href = '/login'; if(res.status === 403) return window.location.href = '/admin'; throw new Error(json?.message || 'Failed') }
      setItems(json.items || [])
    }catch(err:any){ alert(err?.message || 'Failed to load cart') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  const subtotal = items.reduce((s, it) => s + (it.product.price * it.quantity), 0)

  const onSubmit = async (e:any) =>{
    e.preventDefault()
    setError(null)
    // validate address
    const a = addressSchema.safeParse(address)
    if(!a.success){ setError('Invalid address'); return }
    if(paymentMethod === 'DUMMY_CARD'){
      const c = dummyCardSchema.safeParse(card)
      if(!c.success){ setError('Invalid card details'); return }
    }

    setSubmitting(true)
    try{
      // simulate card processing delay on client
      if(paymentMethod === 'DUMMY_CARD') await new Promise(r => setTimeout(r, 1200))

      const body: any = { paymentMethod, address, card: paymentMethod === 'DUMMY_CARD' ? { cardholderName: card.cardholderName } : undefined }
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include' })
      const text = await res.text(); const json = text ? JSON.parse(text) : null
      if(!res.ok){ if(res.status === 401) return window.location.href = '/login'; throw new Error(json?.message || 'Checkout failed') }
      // redirect to order success
      router.push(`/order-success/${json.orderId}`)
    }catch(err:any){ setError(err?.message || 'Checkout failed') }
    finally{ setSubmitting(false) }
  }

  if(loading) return <div className="container py-8">Loading...</div>
  if(items.length === 0) return <div className="container py-8">Your cart is empty. <a href="/shop" className="text-blue-600">Continue shopping</a></div>

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-2xl font-serif">Checkout</h1>
      <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold">Shipping address</h2>
          <div className="mt-3 space-y-2">
            <input placeholder="Full name" value={address.fullName} onChange={e=>setAddress({...address, fullName: e.target.value})} className="w-full border p-2 rounded" />
            <input placeholder="Phone" value={address.phone} onChange={e=>setAddress({...address, phone: e.target.value})} className="w-full border p-2 rounded" />
            <input placeholder="Address line 1" value={address.addressLine1} onChange={e=>setAddress({...address, addressLine1: e.target.value})} className="w-full border p-2 rounded" />
            <input placeholder="Address line 2 (optional)" value={address.addressLine2} onChange={e=>setAddress({...address, addressLine2: e.target.value})} className="w-full border p-2 rounded" />
            <input placeholder="City" value={address.city} onChange={e=>setAddress({...address, city: e.target.value})} className="w-full border p-2 rounded" />
            <input placeholder="State (optional)" value={address.state} onChange={e=>setAddress({...address, state: e.target.value})} className="w-full border p-2 rounded" />
            <input placeholder="Postal code" value={address.postalCode} onChange={e=>setAddress({...address, postalCode: e.target.value})} className="w-full border p-2 rounded" />
            <input placeholder="Country" value={address.country} onChange={e=>setAddress({...address, country: e.target.value})} className="w-full border p-2 rounded" />
          </div>

          <h2 className="font-semibold mt-6">Payment</h2>
          <div className="mt-2">
            <label className="block"><input type="radio" name="pm" checked={paymentMethod==='CASH_ON_DELIVERY'} onChange={()=>setPaymentMethod('CASH_ON_DELIVERY')} /> Cash on Delivery</label>
            <label className="block mt-2"><input type="radio" name="pm" checked={paymentMethod==='DUMMY_CARD'} onChange={()=>setPaymentMethod('DUMMY_CARD')} /> Dummy Card Payment</label>
          </div>

          {paymentMethod === 'DUMMY_CARD' && (
            <div className="mt-3 space-y-2">
              <input placeholder="Cardholder name" value={card.cardholderName} onChange={e=>setCard({...card, cardholderName: e.target.value})} className="w-full border p-2 rounded" />
              <input placeholder="Card number" value={card.cardNumber} onChange={e=>setCard({...card, cardNumber: e.target.value})} className="w-full border p-2 rounded" maxLength={16} />
              <input placeholder="Expiry (MM/YY)" value={card.expiry} onChange={e=>setCard({...card, expiry: e.target.value})} className="w-full border p-2 rounded" />
              <input placeholder="CVV" value={card.cvv} onChange={e=>setCard({...card, cvv: e.target.value})} className="w-full border p-2 rounded" maxLength={3} />
            </div>
          )}

          {error && <div className="text-red-600 mt-3">{error}</div>}
        </div>

        <aside>
          <h2 className="font-semibold">Order summary</h2>
          <div className="mt-3 bg-white p-4 rounded shadow">
            {items.map(it=> (
              <div key={it.id} className="flex items-center gap-3 border-b py-2">
                <img src={it.product.images[0]?.url} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{it.product.title}</div>
                  <div className="text-sm text-slate-600">{it.quantity} × ${(it.product.price/100).toFixed(2)}</div>
                </div>
                <div className="font-semibold">${((it.product.price * it.quantity)/100).toFixed(2)}</div>
              </div>
            ))}

            <div className="mt-4 text-right">
              <div className="font-semibold">Subtotal: ${(subtotal/100).toFixed(2)}</div>
              <div className="mt-4">
                <button className="px-4 py-2 bg-dark-brown text-white rounded" type="submit" disabled={submitting}>{submitting ? 'Processing...' : (paymentMethod === 'DUMMY_CARD' ? 'Pay Now' : 'Place Order')}</button>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  )
}
