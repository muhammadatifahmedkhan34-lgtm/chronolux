import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

export async function GET(req: Request){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const totalUsers = await prisma.user.count({ where: { role: 'CUSTOMER' } })
    const totalProducts = await prisma.product.count()
    const totalOrders = await prisma.order.count()

    const revenueResult = await prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'PAID' }
    })
    const totalRevenue = revenueResult._sum.total ?? 0

    const lowStockProducts = await prisma.product.count({ where: { stock: { lte: 20 } } })
    const outOfStockProducts = await prisma.product.count({ where: { stock: { equals: 0 } } })

    const pendingOrders = await prisma.order.count({ where: { paymentStatus: 'PENDING' } })
    const paidOrders = await prisma.order.count({ where: { paymentStatus: 'PAID' } })

    const pendingReviewsCount = await prisma.review.count({ where: { approved: false } })
    const activeCouponsCount = await prisma.coupon.count({ where: { isActive: true } })

    const recentOrders = await prisma.order.findMany({
      orderBy: { placedAt: 'desc' },
      take: 10,
      include: { user: { select: { id: true, email: true, name: true } } }
    })

    return NextResponse.json({ ok: true, stats: { totalUsers, totalProducts, totalOrders, totalRevenue, lowStockProducts, outOfStockProducts, pendingOrders, paidOrders, pendingReviewsCount, activeCouponsCount }, recentOrders })
  }catch(error:any){
    console.error('Admin dashboard error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to load dashboard' }, { status: 500 })
  }
}
