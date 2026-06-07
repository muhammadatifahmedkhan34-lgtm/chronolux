import React from 'react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

export const metadata = {
  title: 'About ChronoLux',
  description: 'Learn about ChronoLux, a premium luxury watch marketplace.'
}

export default function AboutPage(){
  return (
    <Container>
      <div className="py-12 lg:py-20">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif">About ChronoLux</h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">A curated marketplace bringing together the finest luxury timepieces — authenticated, serviced, and presented with exceptional care.</p>
        </section>

        <section className="grid gap-8 lg:grid-cols-2 items-start mb-12">
          <div>
            <h2 className="text-2xl font-semibold">Our Story</h2>
            <p className="mt-3 text-slate-600">ChronoLux began as a passion project for collectors and enthusiasts who value provenance and craftsmanship. We source watches from trusted partners and verify authenticity through expert inspection.</p>

            <h3 className="mt-6 text-lg font-medium">Mission</h3>
            <p className="mt-2 text-slate-600">To connect discerning buyers with authenticated luxury watches while delivering a seamless, trustworthy shopping experience.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">Why Choose Us</h2>
            <ul className="mt-3 space-y-3 text-slate-600">
              <li>• Expert authentication and condition reports</li>
              <li>• Secure payments and careful handling</li>
              <li>• Curated selection from reputable sources</li>
              <li>• Dedicated customer support and returns policy</li>
            </ul>
          </div>
        </section>

        <section className="bg-white border rounded-lg p-6 mb-12">
          <h2 className="text-2xl font-semibold">Trust & Authenticity</h2>
          <p className="mt-3 text-slate-600">Every watch listed on ChronoLux undergoes a strict authentication process. Our team documents condition, provenance, and service history so you can buy with confidence.</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold">About the Marketplace</h2>
          <p className="mt-3 text-slate-600">ChronoLux is a curated marketplace focused on high-quality listings. We prioritize transparency and detailed imagery so collectors can make informed decisions.</p>
        </section>

        <section className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <a href="/shop" className="btn btn-primary">Shop Watches</a>
          <a href="/contact" className="btn">Contact Us</a>
        </section>
      </div>
    </Container>
  )
}
