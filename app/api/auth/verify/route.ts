import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { signJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

export async function POST(req: Request){
  const { email, code } = await req.json()
  if(!email || !code) return NextResponse.json({ error: 'Missing' }, { status: 422 })

  const token = await prisma.otpToken.findFirst({ where: { email, code, used: false, expiresAt: { gt: new Date() } } })
  if(!token) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })

  // mark used and verify user
  await prisma.otpToken.update({ where: { id: token.id }, data: { used: true } })
  const user = await prisma.user.update({ where: { id: token.userId! }, data: { isVerified: true } })

  const jwt = signJwt({ userId: user.id, role: user.role })

  const response = NextResponse.json({ ok: true, token: jwt })
  response.cookies.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
