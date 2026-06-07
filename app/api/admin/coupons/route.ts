import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'
import { couponCreateSchema } from '@/lib/validations'

const COOKIE_NAME = 'chrono_token'

export async function GET(req: Request){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ ok: true, coupons })
  }catch(error:any){
    console.error('Admin list coupons error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to list coupons' }, { status: 500 })
  }
}

export async function POST(req: Request){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = couponCreateSchema.safeParse(body)
    if(!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid input', issues: parsed.error.format() }, { status: 422 })

    const data: any = {
      code: parsed.data.code.trim().toUpperCase(),
      description: '',
      discountType: parsed.data.discountType as any,
      discountValue: parsed.data.discountValue,
      minimumOrderAmount: parsed.data.minimumOrderAmount ?? null,
      usageLimit: parsed.data.usageLimit ?? null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      isActive: parsed.data.isActive ?? true,
    }

    const coupon = await prisma.coupon.create({ data })
    return NextResponse.json({ ok: true, coupon })
  }catch(error:any){
    console.error('Admin create coupon error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to create coupon' }, { status: 500 })
  }
}
