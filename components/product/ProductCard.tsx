import React from 'react'

export default function ProductCard(){
  return (
    <div className="card">
      <div className="h-48 bg-slate-100 rounded-md mb-4 flex items-center justify-center">Image</div>
      <h3 className="font-medium text-dark-brown">Product Title</h3>
      <p className="text-sm text-slate-600">Brand • Condition</p>
      <div className="mt-4 font-semibold text-dark-brown">$5,200</div>
    </div>
  )
}
