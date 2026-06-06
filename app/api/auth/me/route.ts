import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

export async function GET(req: Request){
  const auth = req.headers.get('authorization')
  if(!auth?.startsWith('Bearer ')) return NextResponse.json(null, { status: 401 })
  const token = auth.split(' ')[1]
  const payload = verifyJwt<{ userId: number }>(token)
  if(!payload) return NextResponse.json(null, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, email: true, name: true, role: true } })
  if(!user) return NextResponse.json(null, { status: 404 })
  return NextResponse.json({ user })
}
