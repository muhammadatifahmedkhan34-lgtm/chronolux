import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

export async function GET(req: Request){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => { try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null } })()
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload || payload.role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' }, include: { user: { select: { id:true, email:true, name:true } }, product: { select: { id:true, title:true } } } })
    return NextResponse.json({ ok: true, reviews })
  }catch(error:any){
    console.error('Admin list reviews error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to list reviews' }, { status: 500 })
  }
}
