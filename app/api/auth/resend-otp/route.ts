import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { sendOtpEmail } from '@/lib/email/resend'

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function emailMustBeSent() {
  return process.env.NODE_ENV === 'production' || process.env.FORCE_EMAIL_SEND === 'true'
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 422 })
    }

    const user = await prisma.user.findFirst({ where: { email, isRemoved: false } })

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ error: 'This email is already verified' }, { status: 409 })
    }

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

    const code = generateOtp()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15)

    await prisma.otpToken.create({
      data: {
        userId: user.id,
        email,
        code,
        purpose: 'REGISTER',
        expiresAt,
      },
    })

    const sendResult = await sendOtpEmail(email, code)
    const mustSend = emailMustBeSent()

    if (mustSend && !sendResult.success) {
      return NextResponse.json(
        {
          error: 'OTP could not be sent. Please check SMTP settings.',
          email,
          emailSendAttempted: true,
          emailSent: false,
          emailProvider: sendResult.provider,
          emailError: sendResult.error || 'Failed to send OTP email',
        },
        { status: 502 }
      )
    }

    const responseBody: any = {
      ok: true,
      email,
      message: 'A new OTP has been sent.',
      emailSendAttempted: mustSend,
      emailSent: sendResult.success && !sendResult.skipped,
      emailSkipped: !!sendResult.skipped,
      emailProvider: sendResult.provider,
    }

    if (!mustSend) {
      console.log('====================================')
      console.log('DEV RESEND OTP FOR:', email)
      console.log('OTP:', code)
      console.log('====================================')
      responseBody.devOtp = code
    }

    return NextResponse.json(responseBody)
  } catch (err: any) {
    console.error('Resend OTP error:', err?.message || err)
    return NextResponse.json({ error: 'Could not resend OTP' }, { status: 500 })
  }
}
