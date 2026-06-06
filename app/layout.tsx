import './globals.css'
import React from 'react'
import Navbar from '../components/site/Navbar'
import Footer from '../components/site/Footer'

export const metadata = {
  title: 'ChronoLux',
  description: 'Premium luxury watches',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
