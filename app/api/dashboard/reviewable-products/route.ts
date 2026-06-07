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

    // find products from user's orders that they haven't reviewed and are published
    const orders = await prisma.order.findMany({ where: { userId: payload.userId }, include: { items: { include: { product: { include: { images: { orderBy: { position: 'asc' } } } } } } } })

    const productsMap: Record<number, any> = {}
    for(const o of orders){
      for(const it of o.items){
        const p = it.product
        if(!p) continue
        if(!p.isPublished) continue
        // skip if already reviewed
        const reviewed = await prisma.review.findFirst({ where: { userId: payload.userId, productId: p.id } })
        if(reviewed) continue
        if(!productsMap[p.id]) productsMap[p.id] = { id: p.id, title: p.title, slug: p.slug, image: p.images?.[0]?.url || null, orderDate: o.placedAt }
      }
    }

    const list = Object.values(productsMap).sort((a:any,b:any)=> +new Date(b.orderDate) - +new Date(a.orderDate))
    return NextResponse.json({ ok: true, products: list })
  }catch(err:any){
    console.error('reviewable-products error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to load products' }, { status: 500 })
  }
}
