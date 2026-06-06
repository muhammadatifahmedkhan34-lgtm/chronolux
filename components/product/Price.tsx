import React from 'react'

export default function Price({ cents }: { cents: number }){
  const value = (cents ?? 0) / 100
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  return (
    <div className="font-semibold text-lg">{formatted}</div>
  )
}
