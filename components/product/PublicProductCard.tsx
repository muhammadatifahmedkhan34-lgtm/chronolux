import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import Price from './Price'
import StockBadge from './StockBadge'
import AddToCartButton from '@/components/cart/AddToCartButton'
import WishlistButton from '@/components/wishlist/WishlistButton'

export default function PublicProductCard({ product }: any){
  const img = product?.images?.[0]?.url
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="h-56 bg-beige rounded-md mb-4 overflow-hidden flex items-center justify-center">
          {img ? (
          <Image src={img} alt={product.title} width={400} height={300} className="object-cover w-full h-full" />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-beige to-coffee-brown text-coffee-brown">
            <div className="text-center">
              <div className="text-3xl font-serif">ChronoLux</div>
              <div className="text-sm mt-1">Luxury Timepieces</div>
            </div>
          </div>
        )}
      </div>
      <h3 className="font-medium text-lg">{product.title}</h3>
      <p className="text-sm text-slate-600">{product.brand?.name ?? 'Unknown'} • {product.condition ?? '—'}</p>
      <div className="mt-4 flex items-center justify-between">
        <Price cents={product.price} />
        <StockBadge stock={product.stock} />
      </div>
      <div className="mt-4 flex gap-2">
        <Link href={`/products/${product.slug}`} className="ml-auto px-3 py-2 bg-dark-brown text-white rounded">View Details</Link>
        <AddToCartButton productId={product.id} max={product.stock} />
        <WishlistButton productId={product.id} />
      </div>
    </div>
  )
}
