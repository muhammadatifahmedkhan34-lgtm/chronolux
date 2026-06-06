"use client"
import React from 'react'

export default function ShopSort({ current = '' }: { current?: string }){
  return (
    <div className="flex items-center gap-3 mb-4">
      <label className="text-sm">Sort:</label>
      <select name="sort" defaultValue={current} className="border p-2 rounded">
        <option value="latest">Latest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="name_asc">Name A-Z</option>
      </select>
    </div>
  )
}
