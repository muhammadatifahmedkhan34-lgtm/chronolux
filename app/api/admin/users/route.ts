import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

export async function GET(req: Request){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, isVerified: true, isBlocked: true, isRemoved: true, createdAt: true, _count: { select: { orders: true } } }
    })

    // compute total spent per user
    const totals = await prisma.order.groupBy({
      by: ['userId'],
      _sum: { total: true },
      where: { userId: { not: null } }
    })
    const totalsMap: Record<number, number> = {}
    for (const t of totals){ if(t.userId) totalsMap[t.userId] = t._sum.total ?? 0 }

    const result = users.map(u=> ({
      ...u,
      totalOrders: u._count?.orders ?? 0,
      totalSpent: totalsMap[u.id] ?? 0
    }))

    return NextResponse.json({ ok: true, users: result })
  }catch(error:any){
    console.error('Admin list users error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to list users' }, { status: 500 })
  }
}
