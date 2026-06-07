import { NextResponse } from 'next/server'

const COOKIE_NAME = 'chrono_token'

export async function POST(){
  const res = NextResponse.json({ ok: true, message: 'Logged out' })
  // Clear the cookie by setting it with Max-Age=0 / empty value
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return res
}
