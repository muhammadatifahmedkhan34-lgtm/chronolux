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
    if(payload.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Admins cannot use customer dashboard' }, { status: 403 })

    const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, email: true, name: true, role: true, isVerified: true } })

    const totalOrders = await prisma.order.count({ where: { userId: payload.userId } })

    const wishlist = await prisma.wishlist.findUnique({ where: { userId: payload.userId }, include: { products: true } })
    const wishlistItems = wishlist?.products?.length || 0

    const cartItemsRows = await prisma.cartItem.findMany({ where: { userId: payload.userId } })
    const cartItems = cartItemsRows.reduce((s, it)=> s + (it.quantity || 0), 0)

    const reviewsSubmitted = await prisma.review.count({ where: { userId: payload.userId } })

    const recentOrders = await prisma.order.findMany({ where: { userId: payload.userId }, orderBy: { placedAt: 'desc' }, take: 5 })

    return NextResponse.json({ ok: true, user, stats: { totalOrders, wishlistItems, cartItems, reviewsSubmitted }, recentOrders })
  }catch(err:any){
    console.error('Dashboard GET error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to load dashboard' }, { status: 500 })
  }
}
