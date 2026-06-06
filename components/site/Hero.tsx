import React from 'react'

export default function Hero(){
  return (
    <section className="luxury-hero py-20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl font-serif">Timeless Craftsmanship</h2>
            <p className="mt-4 text-slate-700">A curated selection of exceptional timepieces.</p>
          </div>
          <div className="h-80 bg-sands rounded-lg shadow-inner flex items-center justify-center">Image</div>
        </div>
      </div>
    </section>
  )
}
