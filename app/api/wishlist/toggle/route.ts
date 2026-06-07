import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

export async function POST(req: Request){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    if(payload.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Admins cannot use wishlist' }, { status: 403 })

    const body = await req.json()
    const productId = Number(body.productId)
    if(isNaN(productId)) return NextResponse.json({ ok: false, message: 'Invalid product' }, { status: 422 })

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if(!product || !product.isPublished) return NextResponse.json({ ok: false, message: 'Product not available' }, { status: 422 })

    // ensure wishlist exists for user
    let wishlist = await prisma.wishlist.findUnique({ where: { userId: payload.userId }, include: { products: true } })
    if(!wishlist){
      wishlist = await prisma.wishlist.create({ data: { userId: payload.userId } , include: { products: true } })
    }

    const exists = wishlist.products.some((p:any)=> p.id === productId)
    if(exists){
      await prisma.wishlist.update({ where: { userId: payload.userId }, data: { products: { disconnect: { id: productId } } } })
      return NextResponse.json({ ok: true, removed: true })
    }

    await prisma.wishlist.update({ where: { userId: payload.userId }, data: { products: { connect: { id: productId } } } })
    return NextResponse.json({ ok: true, added: true })
  }catch(err:any){
    console.error('Toggle wishlist error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to toggle wishlist' }, { status: 500 })
  }
}
