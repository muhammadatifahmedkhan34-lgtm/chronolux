import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

export async function DELETE(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    if(payload.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Admins cannot use wishlist' }, { status: 403 })

    const productId = Number(params.id)
    if(isNaN(productId)) return NextResponse.json({ ok: false, message: 'Invalid product' }, { status: 422 })

    const wishlist = await prisma.wishlist.findUnique({ where: { userId: payload.userId }, include: { products: true } })
    if(!wishlist) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 })

    const exists = wishlist.products.some((p:any)=> p.id === productId)
    if(!exists) return NextResponse.json({ ok: false, message: 'Not in wishlist' }, { status: 404 })

    await prisma.wishlist.update({ where: { userId: payload.userId }, data: { products: { disconnect: { id: productId } } } })
    return NextResponse.json({ ok: true })
  }catch(err:any){
    console.error('Delete wishlist item error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to remove wishlist item' }, { status: 500 })
  }
}
