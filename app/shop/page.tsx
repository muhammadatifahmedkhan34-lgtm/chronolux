import React from 'react'
import { getPublishedProducts, getShopFilters } from '@/lib/shop'
import PublicProductCard from '@/components/product/PublicProductCard'
import ShopFilters from '@/components/shop/ShopFilters'
import ShopSort from '@/components/shop/ShopSort'

export const metadata = {
  title: 'Shop - ChronoLux',
  description: 'Browse our curated selection of luxury timepieces.',
}

type ShopPageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> }

export default async function ShopPage({ searchParams }: ShopPageProps){
  const raw = (await searchParams) ?? {}
  const getFirst = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : v
  const params: Record<string, any> = {}
  const filters: any = {}

  if (getFirst(raw.search)) { params.search = String(getFirst(raw.search)); filters.search = params.search }
  if (getFirst(raw.brand)) { params.brand = String(getFirst(raw.brand)); filters.brand = params.brand }
  if (getFirst(raw.category)) { params.category = String(getFirst(raw.category)); filters.category = params.category }
  if (getFirst(raw.condition)) { params.condition = String(getFirst(raw.condition)); filters.condition = params.condition }
  if (getFirst(raw.movement)) { params.movement = String(getFirst(raw.movement)); filters.movement = params.movement }
  if (getFirst(raw.availability)) { params.availability = String(getFirst(raw.availability)); filters.availability = params.availability }
  if (getFirst(raw.priceMin)) { params.priceMin = String(getFirst(raw.priceMin)); filters.priceMin = Number(getFirst(raw.priceMin)) * 100 }
  if (getFirst(raw.priceMax)) { params.priceMax = String(getFirst(raw.priceMax)); filters.priceMax = Number(getFirst(raw.priceMax)) * 100 }

  const sort = String(getFirst(raw.sort) ?? 'latest')

  const [products, options] = await Promise.all([
    getPublishedProducts({ filters, sort }),
    getShopFilters(),
  ])

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-serif">Shop</h1>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ShopFilters filters={filters} options={options} />
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
