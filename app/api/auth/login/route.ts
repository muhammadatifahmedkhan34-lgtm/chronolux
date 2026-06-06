import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { loginSchema } from '@/lib/validations'
import { comparePassword } from '@/lib/auth/hash'
import { signJwt } from '@/lib/auth/jwt'

export async function POST(req: Request){
  const body = await req.json()
  const parse = loginSchema.safeParse(body)
  if(!parse.success) return NextResponse.json({ error: 'Invalid input' }, { status: 422 })

  const { email, password } = parse.data
  const user = await prisma.user.findUnique({ where: { email } })
  if(!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const ok = await comparePassword(password, user.passwordHash)
  if(!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  if(user.isBlocked || user.isRemoved) return NextResponse.json({ error: 'Account disabled' }, { status: 403 })
  if(!user.isVerified) return NextResponse.json({ error: 'Email not verified' }, { status: 403 })

  const token = signJwt({ userId: user.id, role: user.role })
  return NextResponse.json({ ok: true, token, user: { id: user.id, email: user.email, role: user.role } })
}
