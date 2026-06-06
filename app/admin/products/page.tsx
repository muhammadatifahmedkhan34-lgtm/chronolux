import React from 'react'
import Link from 'next/link'
import ProductActions from '@/components/admin/ProductActions'
import { prisma } from '@/lib/db/prisma'

export default async function ProductsPage(){
  const products = await prisma.product.findMany({ include: { brand: true, category: true, images: true }, orderBy: { updatedAt: 'desc' } })

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">New Product</Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2">Image</th>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Brand</th>
              <th className="text-left p-2">Category</th>
              <th className="text-left p-2">SKU</th>
              <th className="text-left p-2">Price</th>
              <th className="text-left p-2">Stock</th>
              <th className="text-left p-2">Published</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2">
                  {p.images[0] ? <img src={p.images[0].url} alt={p.images[0].altText || p.title} className="h-12 w-12 object-cover" /> : <div className="h-12 w-12 bg-slate-100" />}
                </td>
                <td className="p-2">{p.title}</td>
                <td className="p-2">{p.brand?.name ?? '—'}</td>
                <td className="p-2">{p.category?.name ?? '—'}</td>
                <td className="p-2">{p.sku}</td>
                <td className="p-2">${(p.price/100).toFixed(2)}</td>
                <td className="p-2">{p.stock}</td>
                <td className="p-2">{p.isPublished ? 'Yes' : 'No'}</td>
                <td className="p-2">
                  <ProductActions productId={p.id} editHref={`/admin/products/${p.id}/edit`} productTitle={p.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
