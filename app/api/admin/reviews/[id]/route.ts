import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'

const COOKIE_NAME = 'chrono_token'

export async function PATCH(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => { try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null } })()
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload || payload.role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const id = parseInt(params.id)
    const body = await req.json()
    const action = body.action
    if(!['approve','unapprove'].includes(action)) return NextResponse.json({ ok: false, message: 'Invalid action' }, { status: 422 })

    const updated = await prisma.review.update({ where: { id }, data: { approved: action === 'approve' } })
    return NextResponse.json({ ok: true, review: updated })
  }catch(error:any){
    console.error('Admin update review error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => { try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null } })()
    const payload: any = token ? verifyJwt(token as string) : null
    if(!payload || payload.role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const id = parseInt(params.id)
    await prisma.review.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  }catch(error:any){
    console.error('Admin delete review error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to delete review' }, { status: 500 })
  }
}
