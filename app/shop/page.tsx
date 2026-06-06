import React from 'react'
import ProductCard from '../../components/product/ProductCard'

export default function ShopPage(){
  return (
    <div className="container py-12">
      <h1 className="text-2xl font-serif">Shop</h1>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProductCard />
        <ProductCard />
        <ProductCard />
      </div>
    </div>
  )
}
