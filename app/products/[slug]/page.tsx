import React from 'react'
import { notFound } from 'next/navigation'
import { getProductBySlug, getRelatedProducts } from '@/lib/shop'
import ProductGallery from '@/components/product/ProductGallery'
import AddToCartButton from '@/components/cart/AddToCartButton'
import WishlistButton from '@/components/wishlist/WishlistButton'
import Price from '@/components/product/Price'
import StockBadge from '@/components/product/StockBadge'
import PublicProductCard from '@/components/product/PublicProductCard'
import Reviews from '@/components/product/Reviews'

export async function generateMetadata({ params }: any) {
  const product = await getProductBySlug(params.slug)
  if (!product) return { title: 'Product not found' }
  return {
    title: `${product.title} — ChronoLux`,
    description: product.description ?? 'Luxury timepiece from ChronoLux',
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }){
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product.id, product.categoryId)

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProductGallery images={product.images} />
        </div>
        <aside className="lg:col-span-1 bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-serif">{product.title}</h1>
          <p className="text-sm text-slate-600">{product.brand?.name} • {product.category?.name}</p>
          <div className="mt-4 flex items-center gap-4">
            <Price cents={product.price} />
            <StockBadge stock={product.stock} />
          </div>

          <div className="mt-4 text-sm text-slate-700">{product.description}</div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div><strong>Condition</strong><div>{product.condition ?? '—'}</div></div>
            <div><strong>Movement</strong><div>{product.movement ?? '—'}</div></div>
            <div><strong>Gender</strong><div>{product.gender ?? '—'}</div></div>
            <div><strong>Strap</strong><div>{product.strapMaterial ?? '—'}</div></div>
            <div><strong>Case Size</strong><div>{product.caseSizeMm ?? '—'} mm</div></div>
            <div><strong>SKU</strong><div>{product.sku ?? '—'}</div></div>
          </div>

          <div className="mt-6 flex gap-2">
            <AddToCartButton productId={product.id} max={product.stock} />
            <WishlistButton productId={product.id} />
          </div>
        </aside>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-serif">Related Products</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {related.map((r:any)=> <PublicProductCard key={r.id} product={r} />)}
        </div>
      </section>
      <section className="mt-12">
        <Reviews productId={product.id} />
      </section>
    </div>
  )
}
