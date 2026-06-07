"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchCurrentUser } from '@/lib/auth/client'

export default function AdminReports(){
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    fetchCurrentUser().then(async (u:any)=>{
      if(!u){ router.push('/login'); return }
      if(u.role !== 'ADMIN'){ router.push('/dashboard'); return }
      try{
        const token = localStorage.getItem('chrono_token')
        const headers: Record<string,string> = {}
        if(token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch('/api/admin/reports', { headers, credentials: 'include' })
        const d = await res.json()
        if(!res.ok || !d?.ok){ setError(d?.message || 'Failed'); setLoading(false); return }
        setData(d)
      }catch(err:any){ setError(err?.message || 'Failed') }
      setLoading(false)
    })
  },[])

  if(loading) return <div className="container py-12">Loading reports...</div>
  if(error) return <div className="container py-12 text-red-600">{error}</div>

  const s = data.summary || {}

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif">Reports & Analytics</h1>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Total Revenue</div>
          <div className="mt-2 text-2xl font-semibold">${((s.totalRevenue||0)/100).toFixed(2)}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Total Orders</div>
          <div className="mt-2 text-2xl font-semibold">{s.totalOrders ?? 0}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Total Customers</div>
          <div className="mt-2 text-2xl font-semibold">{s.totalCustomers ?? 0}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Total Products</div>
          <div className="mt-2 text-2xl font-semibold">{s.totalProducts ?? 0}</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Paid Orders</div>
          <div className="mt-2 text-xl font-semibold">{s.paidOrders ?? 0}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Pending Orders</div>
          <div className="mt-2 text-xl font-semibold">{s.pendingOrders ?? 0}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Cancelled Orders</div>
          <div className="mt-2 text-xl font-semibold">{s.cancelledOrders ?? 0}</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Low stock products</div>
          <div className="mt-2 text-xl font-semibold">{s.lowStockProducts ?? 0}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Out of stock</div>
          <div className="mt-2 text-xl font-semibold">{s.outOfStockProducts ?? 0}</div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Top Selling Products</h2>
        {data.topProducts.length === 0 ? <div className="mt-3 text-slate-500">No sales yet</div> : (
          <div className="mt-3 overflow-x-auto bg-white rounded shadow">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Quantity Sold</th>
                  <th className="p-3">Revenue</th>
                  <th className="p-3">Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((t:any)=> (
                  <tr key={t.product.id} className="border-t">
                    <td className="p-3 flex items-center gap-3"><img src={t.product.image || '/placeholder.png'} className="w-12 h-12 object-cover rounded" />{t.product.title}</td>
                    <td className="p-3">{t.totalQuantity}</td>
                    <td className="p-3">${(t.totalRevenue/100).toFixed(2)}</td>
                    <td className="p-3">{t.product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Monthly Revenue (Paid Orders)</h2>
        {data.monthlyRevenue.length === 0 ? <div className="mt-3 text-slate-500">No revenue yet</div> : (
          <div className="mt-3 grid gap-2">
            {data.monthlyRevenue.map((m:any)=> (
              <div key={m.month} className="flex items-center gap-4">
                <div className="w-32 text-sm text-slate-600">{m.month}</div>
                <div className="flex-1 h-4 bg-slate-100 rounded overflow-hidden">
                  <div className="h-4 bg-dark-brown" style={{ width: `${Math.min(100, (m.revenue / (data.summary.totalRevenue || 1)) * 100)}%` }} />
                </div>
                <div className="w-28 text-right">${(m.revenue/100).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Recent Orders</h2>
        {data.recentOrders.length === 0 ? <div className="mt-3 text-slate-500">No recent orders</div> : (
          <div className="mt-3 overflow-x-auto bg-white rounded shadow">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o:any)=> (
                  <tr key={o.id} className="border-t">
                    <td className="p-3">{o.orderNumber}</td>
                    <td className="p-3">{o.user?.email || o.user?.name}</td>
                    <td className="p-3">{new Date(o.placedAt).toLocaleString()}</td>
                    <td className="p-3">${(o.total/100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
