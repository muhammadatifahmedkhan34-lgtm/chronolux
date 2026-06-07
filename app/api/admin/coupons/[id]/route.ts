import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'
import { couponCreateSchema } from '@/lib/validations'

const COOKIE_NAME = 'chrono_token'

export async function GET(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const id = parseInt(params.id)
    const coupon = await prisma.coupon.findUnique({ where: { id } })
    if(!coupon) return NextResponse.json({ ok: false, message: 'Coupon not found' }, { status: 404 })
    return NextResponse.json({ ok: true, coupon })
  }catch(error:any){
    console.error('Admin get coupon error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to get coupon' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const id = parseInt(params.id)
    const body = await req.json()
    const parsed = couponCreateSchema.safeParse(body)
    if(!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid input', issues: parsed.error.format() }, { status: 422 })

    const data: any = {
      code: parsed.data.code.trim().toUpperCase(),
      discountType: parsed.data.discountType as any,
      discountValue: parsed.data.discountValue,
      minimumOrderAmount: parsed.data.minimumOrderAmount ?? null,
      usageLimit: parsed.data.usageLimit ?? null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      isActive: parsed.data.isActive ?? true,
    }

    const updated = await prisma.coupon.update({ where: { id }, data })
    return NextResponse.json({ ok: true, coupon: updated })
  }catch(error:any){
    console.error('Admin update coupon error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to update coupon' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const id = parseInt(params.id)
    await prisma.coupon.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  }catch(error:any){
    console.error('Admin delete coupon error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to delete coupon' }, { status: 500 })
  }
}
