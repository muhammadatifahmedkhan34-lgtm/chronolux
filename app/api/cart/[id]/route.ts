import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

export async function PATCH(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    if(payload.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Admins cannot use cart' }, { status: 403 })

    const id = Number(params.id)
    const body = await req.json()
    const quantity = Number(body.quantity)
    if(isNaN(quantity) || quantity < 1) return NextResponse.json({ ok: false, message: 'Invalid quantity' }, { status: 422 })

    const item = await prisma.cartItem.findUnique({ where: { id } })
    if(!item || item.userId !== payload.userId) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 })

    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if(!product || !product.isPublished) return NextResponse.json({ ok: false, message: 'Product unavailable' }, { status: 422 })
    if(quantity > product.stock) return NextResponse.json({ ok: false, message: 'Quantity exceeds stock' }, { status: 422 })

    const updated = await prisma.cartItem.update({ where: { id }, data: { quantity } })
    return NextResponse.json({ ok: true, item: updated })
  }catch(err:any){
    console.error('Update cart item error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to update cart item' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    if(payload.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Admins cannot use cart' }, { status: 403 })

    const id = Number(params.id)
    const item = await prisma.cartItem.findUnique({ where: { id } })
    if(!item || item.userId !== payload.userId) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 })

    await prisma.cartItem.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  }catch(err:any){
    console.error('Delete cart item error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to delete cart item' }, { status: 500 })
  }
}
