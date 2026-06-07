import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

export async function GET(req: Request){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    if(payload.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Admins cannot use wishlist' }, { status: 403 })

    const wishlist = await prisma.wishlist.findUnique({ where: { userId: payload.userId }, include: { products: { include: { images: { orderBy: { position: 'asc' } }, brand: true } } } })
    return NextResponse.json({ ok: true, wishlist })
  }catch(err:any){
    console.error('Get wishlist error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to get wishlist' }, { status: 500 })
  }
}
