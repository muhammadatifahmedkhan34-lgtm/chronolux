import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

type RouteContext = { params: Promise<Record<string, string | string[] | undefined>> }

export async function GET(req: Request, { params }: RouteContext){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    if(payload.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Admins cannot use customer orders' }, { status: 403 })

    const { id } = await params
    const orderId = Number(Array.isArray(id) ? id[0] : id)
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: { include: { images: true, brand: true } } } }, shippingAddress: true } })
    if(!order || order.userId !== payload.userId) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true, order })
  }catch(err:any){
    console.error('Get order error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to get order' }, { status: 500 })
  }
}
