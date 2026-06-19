import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { hashPassword } from '@/lib/auth/hash'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)

    const token = String(body?.token || '').trim()
    const password = String(body?.password || '')

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 422 }
      )
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 422 }
      )
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        token,
      },
      include: {
        user: true,
      },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      )
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      })

      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new password reset link.' },
        { status: 400 }
      )
    }

    if (!resetToken.user || resetToken.user.isRemoved) {
      return NextResponse.json(
        { error: 'User account was not found' },
        { status: 404 }
      )
    }

    if (resetToken.user.isBlocked) {
      return NextResponse.json(
        { error: 'This account is blocked. Please contact admin.' },
        { status: 403 }
      )
    }

    const passwordHash = await hashPassword(password)

    await prisma.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        passwordHash,
        isVerified: true,
      },
    })

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: resetToken.userId,
      },
    })

    return NextResponse.json({
      ok: true,
      message: 'Password has been reset successfully. You can now login.',
    })
  } catch (err: unknown) {
    console.error('Reset password error:', err instanceof Error ? err.message : err)

    return NextResponse.json(
      { error: 'Password reset failed' },
      { status: 500 }
    )
  }
}