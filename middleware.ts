import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'chrono_token'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  console.log('Middleware path:', pathname)

  // Allow public paths
  const PUBLIC_PATHS = ['/', '/login', '/register', '/verify', '/shop', '/about', '/api']
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // get token from cookie
  const cookie = req.cookies.get(COOKIE_NAME)?.value || null
  console.log('Middleware token exists:', !!cookie)

  // Protect admin routes
  if (pathname.startsWith('/admin')){
    if(!cookie) return NextResponse.redirect(new URL('/login', req.url))
    try{
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'please_change_me')
      const { payload } = await jwtVerify(cookie, secret)
      const role = (payload as any).role
      if(role !== 'ADMIN') return NextResponse.redirect(new URL('/dashboard', req.url))
      return NextResponse.next()
    }catch(e){
      console.error('Middleware JWT verify failed', e)
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')){
    if(!cookie) return NextResponse.redirect(new URL('/login', req.url))
    try{
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'please_change_me')
      const { payload } = await jwtVerify(cookie, secret)
      const role = (payload as any).role
      if(role === 'ADMIN') return NextResponse.redirect(new URL('/admin', req.url))
      return NextResponse.next()
    }catch(e){
      console.error('Middleware JWT verify failed', e)
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*']
}
