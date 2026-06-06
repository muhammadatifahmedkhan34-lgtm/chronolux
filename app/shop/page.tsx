import React from 'react'
import { getPublishedProducts, getShopFilters } from '@/lib/shop'
import PublicProductCard from '@/components/product/PublicProductCard'
import ShopFilters from '@/components/shop/ShopFilters'
import ShopSort from '@/components/shop/ShopSort'

export const metadata = {
  title: 'Shop - ChronoLux',
  description: 'Browse our curated selection of luxury timepieces.',
}

export default async function ShopPage({ searchParams }: { searchParams?: any }){
  const params = searchParams || {}
  const filters: any = {}
  if (params.search) filters.search = params.search
  if (params.brand) filters.brand = params.brand
  if (params.category) filters.category = params.category
  if (params.condition) filters.condition = params.condition
  if (params.movement) filters.movement = params.movement
  if (params.availability) filters.availability = params.availability
  if (params.priceMin) filters.priceMin = Number(params.priceMin) * 100
  if (params.priceMax) filters.priceMax = Number(params.priceMax) * 100

  const sort = params.sort || 'latest'

  const [products, options] = await Promise.all([
    getPublishedProducts({ filters, sort }),
    getShopFilters(),
  ])

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-serif">Shop</h1>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ShopFilters filters={params} options={options} />
        </div>
        <div className="lg:col-span-3">
          <ShopSort current={sort} />

          {products.length === 0 ? (
            <div className="p-8 text-center text-slate-600">No products match your filters.</div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p: any) => (
                <PublicProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
