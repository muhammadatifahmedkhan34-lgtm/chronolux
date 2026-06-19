import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { signJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const code = String(body?.code || '').trim()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and OTP code are required' }, { status: 422 })
    }

    const token = await prisma.otpToken.findFirst({
      where: {
        email,
        code,
        purpose: 'REGISTER',
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!token || !token.userId) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    await prisma.otpToken.update({
      where: { id: token.id },
      data: { used: true },
    })

    await prisma.otpToken.updateMany({
      where: {
        email,
        purpose: 'REGISTER',
        used: false,
      },
      data: {
        used: true,
      },
    })

    const user = await prisma.user.update({
      where: { id: token.userId },
      data: { isVerified: true },
    })

    const jwt = signJwt({ userId: user.id, role: user.role })

    const response = NextResponse.json({
      ok: true,
      token: jwt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    response.cookies.set(COOKIE_NAME, jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (err: any) {
    console.error('Verify email error:', err?.message || err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
