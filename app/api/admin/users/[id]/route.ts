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
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id:true, email:true, name:true, role:true, isVerified:true, isBlocked:true, isRemoved:true, createdAt:true }
    })
    if(!user) return NextResponse.json({ ok: false, message: 'User not found' }, { status: 404 })

    const orders = await prisma.order.findMany({ where: { userId: id }, orderBy: { placedAt: 'desc' }, include: { items: { include: { product: { include: { images: true } } } }, shippingAddress: true } })

    const totalSpentAgg = await prisma.order.aggregate({ _sum: { total: true }, where: { userId: id, paymentStatus: 'PAID' } })
    const totalSpent = totalSpentAgg._sum.total ?? 0

    return NextResponse.json({ ok: true, user, orders, totalSpent })
  }catch(error:any){
    console.error('Admin get user error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to get user' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload || payload.role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const adminId = payload.userId
    const id = parseInt(params.id)
    if(adminId === id) return NextResponse.json({ ok: false, message: 'Cannot perform this action on yourself' }, { status: 403 })

    const target = await prisma.user.findUnique({ where: { id } })
    if(!target) return NextResponse.json({ ok: false, message: 'User not found' }, { status: 404 })
    if(target.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Cannot perform this action on another admin' }, { status: 403 })

    const body = await req.json()
    const action = body.action
    const allowed = ['block','unblock','remove','restore']
    if(!allowed.includes(action)) return NextResponse.json({ ok: false, message: 'Invalid action' }, { status: 422 })

    let data: any = {}
    if(action === 'block') data = { isBlocked: true }
    if(action === 'unblock') data = { isBlocked: false }
    if(action === 'remove') data = { isRemoved: true }
    if(action === 'restore') data = { isRemoved: false }

    const updated = await prisma.user.update({ where: { id }, data, select: { id:true, email:true, name:true, role:true, isVerified:true, isBlocked:true, isRemoved:true, createdAt:true } })
    return NextResponse.json({ ok: true, user: updated })
  }catch(error:any){
    console.error('Admin update user error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to update user' }, { status: 500 })
  }
}
