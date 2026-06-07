import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

function getTokenFromReq(req: Request){
  const auth = req.headers.get('authorization')
  let token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : null
  if(!token){
    try{ token = (req as any).cookies?.get?.(COOKIE_NAME)?.value }catch{}
  }
  return token
}

export async function GET(req: Request){
  try{
    const token = getTokenFromReq(req)
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    if(payload.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Admins cannot use this endpoint' }, { status: 403 })

    const reviews = await prisma.review.findMany({ where: { userId: payload.userId }, orderBy: { createdAt: 'desc' }, include: { product: { include: { images: { orderBy: { position: 'asc' } } } } } })
    return NextResponse.json({ ok: true, reviews })
  }catch(err:any){
    console.error('Dashboard reviews GET error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to load reviews' }, { status: 500 })
  }
}
