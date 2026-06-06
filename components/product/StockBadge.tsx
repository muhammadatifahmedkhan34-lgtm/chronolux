import React from 'react'

export default function StockBadge({ stock }: { stock: number }){
  let text = 'Out of Stock'
  let cls = 'bg-red-100 text-red-700'
  if (stock > 10) { text = 'In Stock'; cls = 'bg-green-100 text-green-700' }
  else if (stock > 0) { text = 'Low Stock'; cls = 'bg-yellow-100 text-yellow-800' }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${cls}`}>{text}</span>
  )
}
