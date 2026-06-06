import React from 'react'

export default function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }){
  return (
    <div>
      <h1 className="text-4xl font-serif text-dark-brown">{title}</h1>
      {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
    </div>
  )
}
