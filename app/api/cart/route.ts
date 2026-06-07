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
    if(payload.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Admins cannot use cart' }, { status: 403 })

    const items = await prisma.cartItem.findMany({ where: { userId: payload.userId }, include: { product: { include: { images: { orderBy: { position: 'asc' } }, brand: true } } } })
    return NextResponse.json({ ok: true, items })
  }catch(err:any){
    console.error('Get cart error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to get cart' }, { status: 500 })
  }
}

export async function POST(req: Request){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    if(payload.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Admins cannot use cart' }, { status: 403 })

    const body = await req.json()
    const productId = Number(body.productId)
    const quantity = Math.max(1, Number(body.quantity || 1))

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if(!product || !product.isPublished) return NextResponse.json({ ok: false, message: 'Product not available' }, { status: 422 })
    if(product.stock < 1) return NextResponse.json({ ok: false, message: 'Out of stock' }, { status: 422 })
    if(quantity > product.stock) return NextResponse.json({ ok: false, message: 'Requested quantity exceeds stock' }, { status: 422 })

    const existing = await prisma.cartItem.findFirst({ where: { userId: payload.userId, productId } })
    if(existing){
      const newQty = Math.min(product.stock, existing.quantity + quantity)
      const updated = await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } })
      return NextResponse.json({ ok: true, item: updated })
    }

    const created = await prisma.cartItem.create({ data: { userId: payload.userId, productId, quantity } })
    return NextResponse.json({ ok: true, item: created })
  }catch(err:any){
    console.error('Add to cart error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to add to cart' }, { status: 500 })
  }
}
