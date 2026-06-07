import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

export async function GET(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const id = parseInt(params.id)
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: { include: { product: { include: { images: true } } } },
        shippingAddress: true
      }
    })
    if(!order) return NextResponse.json({ ok: false, message: 'Order not found' }, { status: 404 })
    return NextResponse.json({ ok: true, order })
  }catch(error:any){
    console.error('Admin get order error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to get order' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const id = parseInt(params.id)
    const body = await req.json()
    const { orderStatus } = body
    const allowed = ['PLACED','PROCESSING','SHIPPED','DELIVERED','CANCELLED']
    if(!allowed.includes(orderStatus)) return NextResponse.json({ ok: false, message: 'Invalid orderStatus' }, { status: 422 })

    const updated = await prisma.order.update({ where: { id }, data: { orderStatus } , include: { user: { select: { id:true,email:true,name:true } }, items: { include: { product: { include: { images: true } } } }, shippingAddress: true } })

    return NextResponse.json({ ok: true, order: updated })
  }catch(error:any){
    console.error('Admin update order error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to update order' }, { status: 500 })
  }
}
