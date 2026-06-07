import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'
import { reviewCreateSchema } from '@/lib/validations'

const COOKIE_NAME = 'chrono_token'

export async function POST(req: Request){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => { try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null } })()
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    if(payload.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Admins cannot submit reviews' }, { status: 403 })

    const body = await req.json()
    const parsed = reviewCreateSchema.safeParse(body)
    if(!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid input', issues: parsed.error.format() }, { status: 422 })

    const { productId, rating, comment } = parsed.data
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if(!product || !product.isPublished) return NextResponse.json({ ok: false, message: 'Product not available' }, { status: 422 })

    // verify purchase
    const purchased = await prisma.order.findFirst({ where: { userId: payload.userId, items: { some: { productId } } } })
    if(!purchased) return NextResponse.json({ ok: false, message: 'Only verified buyers can review this product' }, { status: 403 })

    // prevent duplicate
    const existing = await prisma.review.findFirst({ where: { userId: payload.userId, productId } })
    if(existing) return NextResponse.json({ ok: false, message: 'You have already reviewed this product' }, { status: 409 })

    const created = await prisma.review.create({ data: { userId: payload.userId, productId, rating, body: comment, approved: false } })
    return NextResponse.json({ ok: true, review: created })
  }catch(error:any){
    console.error('Create review error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to create review' }, { status: 500 })
  }
}
