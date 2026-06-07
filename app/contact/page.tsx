import React from 'react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

export const metadata = {
  title: 'Contact ChronoLux',
  description: 'Contact ChronoLux for inquiries, support, and partnerships.'
}

export default function ContactPage(){
  return (
    <Container>
      <div className="py-12 lg:py-20 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif text-center">Contact Us</h1>
        <p className="mt-4 text-center text-slate-600">Questions about an order, a listing, or partnerships? Use the contact information below or send us a message.</p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold">Customer Support</h2>
            <p className="mt-2 text-slate-600">Email: <a className="text-blue-600" href="mailto:support@chronolux.example">support@chronolux.example</a></p>
            <p className="mt-1 text-slate-600">Hours: Mon–Fri, 9am–6pm</p>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold">Partnerships & Wholesale</h2>
            <p className="mt-2 text-slate-600">Email: <a className="text-blue-600" href="mailto:partners@chronolux.example">partners@chronolux.example</a></p>
          </div>
        </div>

        <div className="mt-8 bg-white border rounded-lg p-6">
          <h3 className="text-lg font-medium">Send us a message</h3>
          <p className="mt-2 text-slate-600">This is a placeholder contact form. For production, wire this to an email provider or ticketing system.</p>
          <form className="mt-4 grid gap-3">
            <input className="border p-2 rounded" placeholder="Your name" />
            <input className="border p-2 rounded" placeholder="Your email" />
            <textarea className="border p-2 rounded" placeholder="Message" rows={4} />
            <div className="flex justify-end">
              <Button type="button">Send Message</Button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <a href="/shop" className="btn">Shop Watches</a>
        </div>
      </div>
    </Container>
  )
}
