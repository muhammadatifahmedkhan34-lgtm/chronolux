import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'
import { productSchema } from '@/lib/validations/product'
import { uploadBuffer, deleteByPublicId } from '@/lib/cloudinary'

const COOKIE_NAME = 'chrono_token'

export async function GET(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const id = Number(params.id)
    const product = await prisma.product.findUnique({ where: { id }, include: { images: true, brand: true, category: true } })
    if(!product) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true, product })
  }catch(error:any){
    console.error('Get product error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to get product' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const id = Number(params.id)
    const form = await req.formData()
    const raw: any = {}
    for (const [key, value] of form.entries()){
      if (value instanceof File) continue
      raw[key] = value
    }

    // support simple actions: publish toggle, stock update OR full product update
    if(raw.action === 'publish'){
      const isPublished = raw.isPublished === 'true' || raw.isPublished === '1' || raw.isPublished === true
      await prisma.product.update({ where: { id }, data: { isPublished } })
      return NextResponse.json({ ok: true })
    }

    if(raw.action === 'stock'){
      const change = parseInt(String(raw.change || '0'), 10)
      if(isNaN(change)) return NextResponse.json({ ok: false, message: 'Invalid change' }, { status: 422 })
      const updated = await prisma.product.update({ where: { id }, data: { stock: { increment: change } } })
      await prisma.inventoryLog.create({ data: { productId: id, change, reason: raw.reason || 'Manual update' } })
      return NextResponse.json({ ok: true, stock: updated.stock })
    }

    // Otherwise full update
    const parsed = productSchema.safeParse(raw)
    if(!parsed.success) return NextResponse.json({ ok: false, message: 'Validation failed', issues: parsed.error.format() }, { status: 422 })

    const updateData: any = {
      title: String(parsed.data.title).trim(),
      slug: String(parsed.data.slug).trim(),
      description: parsed.data.description ?? '',
      price: Number(parsed.data.price),
      discount: parsed.data.discount ?? 0,
      stock: Number(parsed.data.stock ?? 0),
      sku: parsed.data.sku ? String(parsed.data.sku).trim() : undefined,
      brandId: parsed.data.brandId ? parseInt(String(parsed.data.brandId)) : undefined,
      categoryId: parsed.data.categoryId ? parseInt(String(parsed.data.categoryId)) : undefined,
      condition: parsed.data.condition ?? undefined,
      movement: parsed.data.movement ?? undefined,
      gender: parsed.data.gender ?? undefined,
      strapMaterial: parsed.data.strapMaterial ?? undefined,
      caseSizeMm: parsed.data.caseSizeMm ? Number(parsed.data.caseSizeMm) : undefined,
      isPublished: parsed.data.isPublished ?? false,
    }

    const updated = await prisma.product.update({ where: { id }, data: updateData })

    // handle images
    const files: File[] = []
    for (const entry of form.values()){
      if (entry instanceof File){
        if (entry.size > 0) files.push(entry)
      }
    }

    const replaceImages = raw.replaceImages === 'true' || raw.replaceImages === '1'
    if(replaceImages){
      // delete existing images from cloudinary and db
      const existing = await prisma.productImage.findMany({ where: { productId: id } })
      for (const im of existing){
        await deleteByPublicId(im.publicId)
      }
      await prisma.productImage.deleteMany({ where: { productId: id } })
    }

    if(files.length > 0){
      const imgs: any[] = []
      for (const file of files){
        try{
          const buffer = Buffer.from(await file.arrayBuffer())
          const uploaded = await uploadBuffer(buffer, file.name)
          imgs.push({ url: uploaded.url, publicId: uploaded.publicId, altText: file.name })
        }catch(err:any){
          console.error('Cloudinary upload failed', err)
          return NextResponse.json({ ok: false, message: 'Cloudinary upload failed' }, { status: 500 })
        }
      }

      await prisma.productImage.createMany({ data: imgs.map((im, idx) => ({ ...im, productId: id, position: idx })) })
    }

    return NextResponse.json({ ok: true, product: updated })
  }catch(error:any){
    console.error('Update product error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: any){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const id = Number(params.id)
    const imgs = await prisma.productImage.findMany({ where: { productId: id } })
    for (const im of imgs){
      await deleteByPublicId(im.publicId)
    }
    await prisma.productImage.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  }catch(error:any){
    console.error('Delete product error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to delete product' }, { status: 500 })
  }
}
