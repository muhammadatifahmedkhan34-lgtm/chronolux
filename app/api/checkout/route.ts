import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'
import { checkoutSchema } from '@/lib/validations'

const COOKIE_NAME = 'chrono_token'

export async function POST(req: Request){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    if(payload.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Admins cannot checkout' }, { status: 403 })

    const body = await req.json()
    const parsed = checkoutSchema.safeParse(body)
    if(!parsed.success) return NextResponse.json({ ok: false, message: 'Invalid input', issues: parsed.error.format() }, { status: 422 })

    // load cart items
    const items = await prisma.cartItem.findMany({ where: { userId: payload.userId }, include: { product: true } })
    if(!items || items.length === 0) return NextResponse.json({ ok: false, message: 'Cart is empty' }, { status: 422 })

    // validate products
    for(const it of items){
      if(!it.product || !it.product.isPublished) return NextResponse.json({ ok: false, message: `Product ${it.product?.title || it.productId} not available` }, { status: 422 })
      if(it.quantity > it.product.stock) return NextResponse.json({ ok: false, message: `Insufficient stock for ${it.product.title}` }, { status: 422 })
    }

    // compute totals
    const subtotal = items.reduce((s, it) => s + (it.product.price * it.quantity), 0)
    const tax = 0
    const shipping = 0
    const total = subtotal + tax + shipping

    // determine payment fields
    const paymentMethod = parsed.data.paymentMethod
    const paymentStatus = paymentMethod === 'DUMMY_CARD' ? 'PAID' : 'PENDING'
    const orderStatus = 'PLACED'

    // create order in transaction
    const result = await prisma.$transaction(async (tx) => {
      // create shipping address
      const addr = await tx.address.create({ data: {
        userId: payload.userId,
        fullName: parsed.data.address.fullName,
        phone: parsed.data.address.phone,
        line1: parsed.data.address.addressLine1,
        line2: parsed.data.address.addressLine2 || null,
        city: parsed.data.address.city,
        state: parsed.data.address.state || null,
        postalCode: parsed.data.address.postalCode,
        country: parsed.data.address.country,
      } })

      // generate order number
      const orderNumber = `ORD${Date.now()}`

      const order = await tx.order.create({ data: {
        userId: payload.userId,
        orderNumber,
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod: paymentMethod as any,
        paymentStatus: paymentStatus as any,
        orderStatus: orderStatus as any,
        shippingAddressId: addr.id,
      } })

      // create order items and reduce stock
      for(const it of items){
        await tx.orderItem.create({ data: { orderId: order.id, productId: it.productId, unitPrice: it.product.price, quantity: it.quantity } })
        await tx.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.quantity } } })
      }

      // clear user's cart
      await tx.cartItem.deleteMany({ where: { userId: payload.userId } })

      return order
    })

    // send order email in dev as log or via Resend if configured
    if (process.env.NODE_ENV !== 'production'){
      console.log('Order placed (dev):', result.id, 'orderNumber:', result.orderNumber)
    }

    return NextResponse.json({ ok: true, orderId: result.id, orderNumber: result.orderNumber })
  }catch(err:any){
    console.error('Checkout error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Checkout failed' }, { status: 500 })
  }
}
