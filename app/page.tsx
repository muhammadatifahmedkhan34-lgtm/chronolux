import React from 'react'
import SectionHeading from '../components/ui/SectionHeading'

export default function Home() {
  return (
    <div className="luxury-hero py-16">
      <div className="container">
        <SectionHeading title="ChronoLux" subtitle="Crafted Timepieces — Curated for Connoisseurs" />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif text-dark-brown">Experience Horological Excellence</h2>
            <p className="mt-6 max-w-xl text-slate-700">Discover a curated collection of premium luxury watches from iconic brands. Minimal design, editorial layouts, and an elevated shopping experience.</p>
          </div>
          <div>
            
            <div className="h-80 bg-sands rounded-lg shadow-lg flex items-center justify-center">
              
              <span className="text-coffee-brown">[Hero watch image placeholder]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
