"use client"
import React from 'react'

export default function ShopFilters({ filters = {}, options = {} }: any){
  const { search = '', brand = '', category = '', condition = '', movement = '', priceMin = '', priceMax = '', availability = '' } = filters
  const { brands = [], categories = [], conditions = [], movements = [], priceMin: globalMin = 0, priceMax: globalMax = 0 } = options

  return (
    <form className="bg-white p-4 rounded shadow mb-6" method="get">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input name="search" defaultValue={search} placeholder="Search products" className="border p-2 rounded w-full" />
        <select name="brand" defaultValue={brand} className="border p-2 rounded w-full">
          <option value="">All Brands</option>
          {brands.map((b:any)=> <option key={b.slug} value={b.slug}>{b.name}</option>)}
        </select>
        <select name="category" defaultValue={category} className="border p-2 rounded w-full">
          <option value="">All Categories</option>
          {categories.map((c:any)=> <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select name="condition" defaultValue={condition} className="border p-2 rounded w-full">
          <option value="">Any Condition</option>
          {conditions.map((c:string)=> <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="movement" defaultValue={movement} className="border p-2 rounded w-full">
          <option value="">Any Movement</option>
          {movements.map((m:string)=> <option key={m} value={m}>{m}</option>)}
        </select>
        <select name="availability" defaultValue={availability} className="border p-2 rounded w-full">
          <option value="">Any Availability</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <input name="priceMin" defaultValue={priceMin} type="number" placeholder={`Min (${(globalMin/100)||0})`} className="border p-2 rounded" />
        <input name="priceMax" defaultValue={priceMax} type="number" placeholder={`Max (${(globalMax/100)||0})`} className="border p-2 rounded" />
      </div>

      <div className="mt-3 flex gap-2">
        <button type="submit" className="px-3 py-2 bg-dark-brown text-white rounded">Apply</button>
        <a href="/shop" className="px-3 py-2 border rounded">Reset</a>
      </div>
    </form>
  )
}
