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
  const existing = await prisma.user.findUnique({ where: { email } })
  if(existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({ data: { email, passwordHash, name } })

  // create OTP token
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15)
  await prisma.otpToken.create({ data: { userId: user.id, email, code, purpose: 'REGISTER', expiresAt } })

  // send email (best-effort)
  try{
    const result = await sendOtpEmail(email, code)
    if(!result || result.success === false){
      console.error('sendOtpEmail failed', result?.error)
    }
  }catch(e){ console.error('resend error', e) }

  // In development, log the OTP and include it in the response for convenience
  if (process.env.NODE_ENV !== 'production') {
    try{
      console.log('====================================')
      console.log('DEV OTP FOR:', email)
      console.log('OTP:', code)
      console.log('====================================')
    }catch(e){ /* ignore */ }
  }

  const responseBody: any = { ok: true, message: 'Registered. Verify your email.' }
  if (process.env.NODE_ENV !== 'production') responseBody.devOtp = code

  return NextResponse.json(responseBody)
}
