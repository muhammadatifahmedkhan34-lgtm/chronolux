import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

export async function GET(req: Request, { params }: any){
  try{
    const productId = parseInt(params.id)
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => { try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null } })()
    const payload: any = token ? verifyJwt(token as string) : null

    const reviews = await prisma.review.findMany({ where: { productId, approved: true }, orderBy: { createdAt: 'desc' }, include: { user: { select: { id:true, name:true, email:true } } } })
    const agg = await prisma.review.aggregate({ _avg: { rating: true }, _count: { rating: true }, where: { productId, approved: true } })

    let userReview = null
    let canReview = false
    if(payload){
      userReview = await prisma.review.findFirst({ where: { productId, userId: payload.userId } })
      // check if user purchased this product
      const purchased = await prisma.order.findFirst({ where: { userId: payload.userId, items: { some: { productId } } } })
      canReview = !!purchased
    }

    return NextResponse.json({ ok: true, reviews, averageRating: agg._avg.rating ?? null, reviewCount: agg._count.rating ?? 0, userReview, canReview })
  }catch(error:any){
    console.error('List product reviews error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to list reviews' }, { status: 500 })
  }
}
