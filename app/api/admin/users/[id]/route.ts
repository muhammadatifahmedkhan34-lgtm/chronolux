import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

export async function GET(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const id = parseInt(params.id)
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id:true, email:true, name:true, role:true, isVerified:true, isBlocked:true, isRemoved:true, createdAt:true }
    })
    if(!user) return NextResponse.json({ ok: false, message: 'User not found' }, { status: 404 })

    const orders = await prisma.order.findMany({ where: { userId: id }, orderBy: { placedAt: 'desc' }, include: { items: { include: { product: { include: { images: true } } } }, shippingAddress: true } })

    const totalSpentAgg = await prisma.order.aggregate({ _sum: { total: true }, where: { userId: id, paymentStatus: 'PAID' } })
    const totalSpent = totalSpentAgg._sum.total ?? 0

    return NextResponse.json({ ok: true, user, orders, totalSpent })
  }catch(error:any){
    console.error('Admin get user error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to get user' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload || payload.role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const adminId = payload.userId
    const id = parseInt(params.id)
    if(adminId === id) return NextResponse.json({ ok: false, message: 'Cannot perform this action on yourself' }, { status: 403 })

    const target = await prisma.user.findUnique({ where: { id } })
    if(!target) return NextResponse.json({ ok: false, message: 'User not found' }, { status: 404 })
    if(target.role === 'ADMIN') return NextResponse.json({ ok: false, message: 'Cannot perform this action on another admin' }, { status: 403 })

    const body = await req.json()
    const action = body.action
    const allowed = ['block','unblock','remove']
    if(!allowed.includes(action)) return NextResponse.json({ ok: false, message: 'Invalid action' }, { status: 422 })

    // block/unblock are simple updates
    if(action === 'block'){
      const updated = await prisma.user.update({ where: { id }, data: { isBlocked: true }, select: { id:true, email:true, name:true, role:true, isVerified:true, isBlocked:true, isRemoved:true, createdAt:true } })
      return NextResponse.json({ ok: true, user: updated })
    }
    if(action === 'unblock'){
      const updated = await prisma.user.update({ where: { id }, data: { isBlocked: false }, select: { id:true, email:true, name:true, role:true, isVerified:true, isBlocked:true, isRemoved:true, createdAt:true } })
      return NextResponse.json({ ok: true, user: updated })
    }

    // Permanent delete for 'remove'
    if(action === 'remove'){
      // Only allow deleting CUSTOMER users
      if(target.role !== 'CUSTOMER') return NextResponse.json({ ok: false, message: 'Only customer accounts can be permanently deleted' }, { status: 403 })

      console.log('[ADMIN DELETE] targetUserId:', id)
      console.log('[ADMIN DELETE] action:', action)

      try{
        console.log('[ADMIN DELETE] starting transaction to delete user', id)
        const result = await prisma.$transaction(async (tx) => {
          // Disassociate orders: keep order history but remove user association and shipping address
          await tx.order.updateMany({ where: { userId: id }, data: { userId: null, shippingAddressId: null } })

          // Remove cart items
          await tx.cartItem.deleteMany({ where: { userId: id } })

          // Remove wishlist (and its relations)
          await tx.wishlist.deleteMany({ where: { userId: id } })

          // Remove reviews
          await tx.review.deleteMany({ where: { userId: id } })

          // Remove OTP and password reset tokens
          await tx.otpToken.deleteMany({ where: { userId: id } })
          await tx.passwordResetToken.deleteMany({ where: { userId: id } })

          // Remove addresses
          await tx.address.deleteMany({ where: { userId: id } })

          // Finally delete the user
          await tx.user.delete({ where: { id } })

          return true
        })

        console.log('[ADMIN DELETE] user delete succeeded for id', id)
        if(result) return NextResponse.json({ ok: true, message: 'User permanently deleted', deletedUserId: id })
        return NextResponse.json({ ok: false, message: 'Failed to delete user' }, { status: 500 })
      }catch(e:any){
        console.error('[ADMIN DELETE] error deleting user:', e)
        return NextResponse.json({ ok: false, message: 'Failed to permanently delete user', detail: e?.message || String(e) }, { status: 500 })
      }
    }
  }catch(error:any){
    console.error('Admin update user error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to update user' }, { status: 500 })
  }
}
