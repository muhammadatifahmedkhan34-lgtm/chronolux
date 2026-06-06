import React from 'react'

export default function ProductCard(){
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="h-48 bg-slate-100 rounded-md mb-4 flex items-center justify-center">Image</div>
      <h3 className="font-medium">Product Title</h3>
      <p className="text-sm text-slate-600">Brand • Condition</p>
      <div className="mt-4 font-semibold">$5,200</div>
    </div>
  )
}
