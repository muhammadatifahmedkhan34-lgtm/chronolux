import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJwt } from '@/lib/auth/jwt'
import { productSchema } from '@/lib/validations/product'
import { uploadBuffer } from '@/lib/cloudinary'

const COOKIE_NAME = 'chrono_token'

export async function GET(req: Request){
  try{
    // admin auth check
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const products = await prisma.product.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { brand: true, category: true, images: true }
    })

    return NextResponse.json({ ok: true, products })
  }catch(error:any){
    console.error('List products error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to list products' }, { status: 500 })
  }
}

export async function POST(req: Request){
  try{
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || (() => {
      try{ const c = (req as any).cookies?.get?.(COOKIE_NAME)?.value; return c }catch{ return null }
    })()
    const payload = token ? verifyJwt(token as string) : null
    if(!payload || (payload as any).role !== 'ADMIN') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const form = await req.formData()
    const raw: any = {}
    for (const [key, value] of form.entries()){
      if (value instanceof File) continue
      raw[key] = value
    }

    const parsed = productSchema.safeParse(raw)
    if(!parsed.success) return NextResponse.json({ ok: false, message: 'Validation failed', issues: parsed.error.format() }, { status: 422 })

    // create product
    const productData: any = {
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

    const p = await prisma.product.create({ data: productData })

    // handle images
    const files: File[] = []
    for (const entry of form.values()){
      if (entry instanceof File){
        if (entry.size > 0) files.push(entry)
      }
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

      await prisma.productImage.createMany({ data: imgs.map((im, idx) => ({ ...im, productId: p.id, position: idx })) })
    }

    const product = await prisma.product.findUnique({ where: { id: p.id }, include: { images: true, brand: true, category: true } })
    return NextResponse.json({ ok: true, product })
  }catch(error:any){
    console.error('Create product error:', error)
    return NextResponse.json({ ok: false, message: error?.message || 'Failed to create product' }, { status: 500 })
  }
}
