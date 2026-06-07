import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

function getToken(req: Request){
  const auth = req.headers.get('authorization')
  let token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : null
  if(!token){ try{ token = (req as any).cookies?.get?.(COOKIE_NAME)?.value }catch{} }
  return token
}

export async function GET(req: Request){
  try{
    const token = getToken(req)
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload || payload.role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    // summary
    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } })
    const totalProducts = await prisma.product.count()
    const totalOrders = await prisma.order.count()

    const paidOrders = await prisma.order.count({ where: { paymentStatus: 'PAID' } })
    const pendingOrders = await prisma.order.count({ where: { paymentStatus: 'PENDING' } })
    const cancelledOrders = await prisma.order.count({ where: { orderStatus: 'CANCELLED' } })

    const revenueAgg = await prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } })
    const totalRevenue = revenueAgg._sum.total ?? 0

    const lowStockProducts = await prisma.product.findMany({ where: { stock: { lte: 20 } }, select: { id: true, title: true, slug: true, stock: true, images: { take: 1 } } })
    const outOfStockProducts = await prisma.product.findMany({ where: { stock: 0 }, select: { id: true, title: true, slug: true, stock: true, images: { take: 1 } } })

    // top products (from paid orders only)
    const items = await prisma.orderItem.findMany({ where: { order: { paymentStatus: 'PAID' } }, include: { product: { select: { id: true, title: true, images: { take: 1 }, stock: true } } } })
    const topMap: Record<string, { product: any, quantity: number, revenue: number }> = {}
    for(const it of items){
      const pid = String(it.productId)
      if(!topMap[pid]) topMap[pid] = { product: it.product, quantity: 0, revenue: 0 }
      topMap[pid].quantity += it.quantity
      topMap[pid].revenue += it.unitPrice * it.quantity
    }
    const topProducts = Object.values(topMap).sort((a,b)=> b.quantity - a.quantity).slice(0,20).map(tp=> ({ product: { id: tp.product.id, title: tp.product.title, image: tp.product.images?.[0]?.url || null, stock: tp.product.stock }, totalQuantity: tp.quantity, totalRevenue: tp.revenue }))

    // monthly revenue (paid orders only)
    const paidOrdersList = await prisma.order.findMany({ where: { paymentStatus: 'PAID' }, select: { placedAt: true, total: true } })
    const monthlyMap: Record<string, number> = {}
    for(const o of paidOrdersList){
      const d = new Date(o.placedAt)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      monthlyMap[key] = (monthlyMap[key] || 0) + (o.total || 0)
    }
    const monthlyRevenue = Object.keys(monthlyMap).sort().map(k=> ({ month: k, revenue: monthlyMap[k] }))

    const recentOrders = await prisma.order.findMany({ where: {}, orderBy: { placedAt: 'desc' }, take: 20, include: { user: { select: { id: true, email: true, name: true } } } })

    return NextResponse.json({ ok: true, summary: { totalRevenue, totalOrders, totalCustomers, totalProducts, paidOrders, pendingOrders, cancelledOrders, lowStockProducts: lowStockProducts.length, outOfStockProducts: outOfStockProducts.length }, topProducts, monthlyRevenue, recentOrders })
  }catch(err:any){
    console.error('Admin reports error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to load reports' }, { status: 500 })
  }
}
