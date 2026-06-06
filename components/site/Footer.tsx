import React from 'react'

export default function Footer(){
  return (
    <footer className="border-t border-slate-100 bg-white mt-12">
      <div className="container py-8 text-center text-sm text-slate-600">
        © {new Date().getFullYear()} ChronoLux. All rights reserved.
      </div>
    </footer>
  )
}
