import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { registerSchema } from '@/lib/validations'
import { hashPassword } from '@/lib/auth/hash'
import { sendOtpEmail } from '@/lib/email/resend'

export async function POST(req: Request) {
  const body = await req.json()
  const parse = registerSchema.safeParse(body)
  if(!parse.success) return NextResponse.json({ error: 'Invalid input', details: parse.error.format() }, { status: 422 })

  const { email, password, name } = parse.data
  // Only consider non-removed users as existing so permanently deleted emails can be re-used
  const existing = await prisma.user.findFirst({ where: { email, isRemoved: false } })
  if(existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({ data: { email, passwordHash, name } })

  // create OTP token
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15)
  await prisma.otpToken.create({ data: { userId: user.id, email, code, purpose: 'REGISTER', expiresAt } })

  // Decide whether to send OTP via Resend. In production we always send; in
  // development sending is optional and controlled via FORCE_EMAIL_SEND="true".
  let sendResult: any = null
  try{
    sendResult = await sendOtpEmail(email, code)
    if(!sendResult || sendResult.success === false){
      console.error('sendOtpEmail failed', sendResult?.error)
    }
  }catch(e){ console.error('email send error', e) }

  // In development show/log the OTP only when emails are NOT being forced to send.
  const emailsForced = (process.env.NODE_ENV === 'production') || (process.env.FORCE_EMAIL_SEND === 'true')

  const responseBody: any = { ok: true, message: 'Registered. Verify your email.' }

  if (!emailsForced) {
    try{
      console.log('====================================')
      console.log('DEV OTP FOR:', email)
      console.log('OTP:', code)
      console.log('====================================')
    }catch(e){ /* ignore */ }
    // include devOtp in development when not forcing email send
    responseBody.devOtp = code
  } else {
    // when emails are forced (or in production) expose safe email send metadata
    responseBody.emailSendAttempted = true
    responseBody.emailSent = !!sendResult?.success
    responseBody.emailProvider = sendResult?.provider || process.env.EMAIL_PROVIDER || 'smtp'
    if(!sendResult?.success) responseBody.emailError = sendResult?.error || 'Failed to send OTP email'
  }

  return NextResponse.json(responseBody)
}
