import { prisma } from './db/prisma'

type ProductFilters = {
  search?: string
  brand?: string
  category?: string
  condition?: string
  movement?: string
  priceMin?: number
  priceMax?: number
  availability?: string
}

export async function getPublishedProducts(opts: {
  filters?: ProductFilters
  sort?: string
  skip?: number
  take?: number
}) {
  const { filters = {}, sort, skip, take } = opts || {}
  const where: any = { isPublished: true }

  if (filters.search) {
    where.title = { contains: filters.search, mode: 'insensitive' }
  }
  if (filters.brand) where.brand = { slug: filters.brand }
  if (filters.category) where.category = { slug: filters.category }
  if (filters.condition) where.condition = filters.condition
  if (filters.movement) where.movement = filters.movement
  if (typeof filters.priceMin === 'number' || typeof filters.priceMax === 'number') {
    where.price = {}
    if (typeof filters.priceMin === 'number') where.price.gte = Math.round(filters.priceMin)
    if (typeof filters.priceMax === 'number') where.price.lte = Math.round(filters.priceMax)
  }
  if (filters.availability) {
    if (filters.availability === 'in_stock') where.stock = { gt: 10 }
    if (filters.availability === 'low_stock') where.stock = { gte: 1, lte: 10 }
    if (filters.availability === 'out_of_stock') where.stock = 0
  }

  const orderBy: any = {}
  switch (sort) {
    case 'price_asc':
      orderBy.price = 'asc'
      break
    case 'price_desc':
      orderBy.price = 'desc'
      break
    case 'name_asc':
      orderBy.title = 'asc'
      break
    default:
      orderBy.createdAt = 'desc'
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip,
    take,
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: 'asc' } },
    },
  })

  return products
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isPublished: true },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: 'asc' } },
    },
  })
  return product
}

export async function getShopFilters() {
  const brands = await prisma.brand.findMany({ select: { id: true, name: true, slug: true } })
  const categories = await prisma.category.findMany({ select: { id: true, name: true, slug: true } })
  const conditions = await prisma.product.findMany({
    where: { isPublished: true, condition: { not: null } },
    distinct: ['condition'],
    select: { condition: true },
  })
  const movements = await prisma.product.findMany({
    where: { isPublished: true, movement: { not: null } },
    distinct: ['movement'],
    select: { movement: true },
  })
  const priceAgg = await prisma.product.aggregate({
    _min: { price: true },
    _max: { price: true },
    where: { isPublished: true },
  })

  return {
    brands,
    categories,
    conditions: conditions.map((c) => c.condition).filter(Boolean),
    movements: movements.map((m) => m.movement).filter(Boolean),
    priceMin: priceAgg._min.price ?? 0,
    priceMax: priceAgg._max.price ?? 0,
  }
}

export async function getRelatedProducts(productId: number, categoryId?: number, take = 4) {
  if (!categoryId) return []
  const related = await prisma.product.findMany({
    where: { isPublished: true, categoryId, id: { not: productId } },
    take,
    orderBy: { createdAt: 'desc' },
    include: { images: { orderBy: { position: 'asc' } } },
  })
  return related
}

export default {}
