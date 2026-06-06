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

    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json({ ok: true, brands })
  }catch(error:any){
    console.error('List brands error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to list brands' }, { status: 500 })
  }
}
