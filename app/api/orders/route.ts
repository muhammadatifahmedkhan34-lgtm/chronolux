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
    if(payload.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Admins cannot use customer orders' }, { status: 403 })

    const orders = await prisma.order.findMany({ where: { userId: payload.userId }, orderBy: { placedAt: 'desc' } })
    return NextResponse.json({ ok: true, orders })
  }catch(err:any){
    console.error('Get orders error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to get orders' }, { status: 500 })
  }
}
