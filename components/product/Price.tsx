import React from 'react'

type Cents = number | bigint | null | undefined

export default function Price({ cents }: { cents?: Cents }){
  const centsValue = cents ?? 0
  const centsNumber = typeof centsValue === 'bigint' ? Number(centsValue) : centsValue
  const value = (centsNumber as number) / 100
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  return (
    <div className="font-semibold text-lg">{formatted}</div>
  )
}
