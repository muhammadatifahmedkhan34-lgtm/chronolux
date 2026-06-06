"use client"
import React, { useState } from 'react'
import Image from 'next/image'

export default function ProductGallery({ images }: { images: any[] }){
  const imgs = images || []
  const [index, setIndex] = useState(0)
  const main = imgs[index]

  return (
    <div>
      <div className="w-full h-96 bg-slate-50 rounded mb-4 flex items-center justify-center overflow-hidden">
        {main ? (
          <Image src={main.url} alt={main.altText ?? 'Product image'} width={800} height={600} className="object-contain w-full h-full" />
        ) : (
          <div className="text-center text-slate-500">No image</div>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {imgs.map((im, i) => (
          <button key={im.id ?? i} onClick={() => setIndex(i)} className={`flex-shrink-0 w-24 h-24 rounded overflow-hidden border ${i===index? 'ring-2 ring-gold':'border-slate-200'}`}>
            <Image src={im.url} alt={im.altText ?? 'thumb'} width={96} height={96} className="object-cover w-full h-full" />
          </button>
        ))}
      </div>
    </div>
  )
}
