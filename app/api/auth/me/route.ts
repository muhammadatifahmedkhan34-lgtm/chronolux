import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

function getTokenFromCookieHeader(cookieHeader: string | null){
  if(!cookieHeader) return null
  const parts = cookieHeader.split(';').map(p=>p.trim())
  for(const part of parts){
    if(part.startsWith('chrono_token=')) return part.split('=')[1]
  }
  return null
}

export async function GET(req: Request){
  const auth = req.headers.get('authorization')
  let token: string | null = null
  if(auth?.startsWith('Bearer ')) token = auth.split(' ')[1]
  if(!token){
    // try cookie
    const cookieHeader = req.headers.get('cookie')
    token = getTokenFromCookieHeader(cookieHeader)
  }

  if(!token) return NextResponse.json(null, { status: 401 })

  const payload = verifyJwt<{ userId: number }>(token)
  if(!payload) return NextResponse.json(null, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, email: true, name: true, role: true } })
  if(!user) return NextResponse.json(null, { status: 404 })
  return NextResponse.json({ user })
}
