import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { couponValidateSchema } from '@/lib/validations'

export async function POST(req: Request){
  try{
    const body = await req.json()
    const parsed = couponValidateSchema.safeParse(body)
    if(!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid input', issues: parsed.error.format() }, { status: 422 })

    const code = parsed.data.code.trim().toUpperCase()
    const subtotal = Number(parsed.data.subtotal)

    const coupon = await prisma.coupon.findUnique({ where: { code } })
    if(!coupon) return NextResponse.json({ ok: false, message: 'Coupon not found' }, { status: 404 })
    if(!coupon.isActive) return NextResponse.json({ ok: false, message: 'Coupon is inactive' }, { status: 422 })
    if(coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) return NextResponse.json({ ok: false, message: 'Coupon has expired' }, { status: 422 })
    if(coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return NextResponse.json({ ok: false, message: 'Coupon usage limit exceeded' }, { status: 422 })
    if(coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) return NextResponse.json({ ok: false, message: 'Minimum order amount not met' }, { status: 422 })

    let discountAmount = 0
    if(coupon.discountType === 'FIXED'){
      discountAmount = coupon.discountValue
    }else{
      // percentage
      discountAmount = Math.floor(subtotal * (coupon.discountValue / 100))
    }
    if(discountAmount > subtotal) discountAmount = subtotal
    const totalAfterDiscount = subtotal - discountAmount

    return NextResponse.json({ ok: true, coupon: { id: coupon.id, code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue }, discountAmount, totalAfterDiscount })
  }catch(error:any){
    console.error('Coupon validate error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to validate coupon' }, { status: 500 })
  }
}
