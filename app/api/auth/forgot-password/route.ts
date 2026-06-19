import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { sendPasswordResetEmail } from '@/lib/email/resend'

function emailMustBeSent() {
  return process.env.NODE_ENV === 'production' || process.env.FORCE_EMAIL_SEND === 'true'
}

function getAppUrl(req: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')

  if (configuredUrl) {
    return configuredUrl
  }

  return new URL(req.url).origin
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const email = String(body?.email || '').trim().toLowerCase()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 422 }
      )
    }

    const genericMessage = 'If an account exists with this email, a password reset link has been sent.'

    const user = await prisma.user.findFirst({
      where: {
        email,
        isRemoved: false,
      },
    })

    /*
      Important:
      We return the same success message even if user does not exist.
      This is safer because it does not reveal which emails are registered.
    */
    if (!user) {
      return NextResponse.json({
        ok: true,
        message: genericMessage,
      })
    }

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    })

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30)

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    const resetUrl = `${getAppUrl(req)}/reset-password?token=${encodeURIComponent(token)}`

    const sendResult = await sendPasswordResetEmail(email, resetUrl)
    const mustSend = emailMustBeSent()

    if (mustSend && !sendResult.success) {
      return NextResponse.json(
        {
          error: 'Password reset email could not be sent. Please check SMTP settings.',
          emailSendAttempted: true,
          emailSent: false,
          emailProvider: sendResult.provider,
          emailError: sendResult.error || 'Failed to send password reset email',
        },
        { status: 502 }
      )
    }

    const responseBody: {
      ok: boolean
      message: string
      emailSendAttempted: boolean
      emailSent: boolean
      emailSkipped: boolean
      emailProvider: string
      devResetUrl?: string
    } = {
      ok: true,
      message: genericMessage,
      emailSendAttempted: mustSend,
      emailSent: sendResult.success && !sendResult.skipped,
      emailSkipped: Boolean(sendResult.skipped),
      emailProvider: sendResult.provider,
    }

    /*
      In development, if FORCE_EMAIL_SEND is not true,
      we show the reset link on screen so you can test the flow
      even before SMTP is fully working.
    */
    if (!mustSend) {
      console.log('====================================')
      console.log('DEV RESET LINK FOR:', email)
      console.log(resetUrl)
      console.log('====================================')

      responseBody.devResetUrl = resetUrl
    }

    return NextResponse.json(responseBody)
  } catch (err: unknown) {
    console.error('Forgot password error:', err instanceof Error ? err.message : err)

    return NextResponse.json(
      { error: 'Password reset request failed' },
      { status: 500 }
    )
  }
}