import { z } from 'zod'

export const productSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.preprocess((v) => parseInt(String(v || '0'), 10), z.number().int().nonnegative()),
  discount: z.preprocess((v) => v === undefined ? 0 : parseInt(String(v), 10), z.number().int().nonnegative()),
  stock: z.preprocess((v) => parseInt(String(v || '0'), 10), z.number().int().nonnegative()),
  sku: z.string().optional(),
  brandId: z.preprocess((v) => v === '' ? null : v, z.string().nullable()).optional(),
  categoryId: z.preprocess((v) => v === '' ? null : v, z.string().nullable()).optional(),
  condition: z.string().optional(),
  movement: z.string().optional(),
  gender: z.string().optional(),
  strapMaterial: z.string().optional(),
  caseSizeMm: z.preprocess((v) => v ? parseFloat(String(v)) : undefined, z.number().optional()),
  isPublished: z.preprocess((v) => v === 'true' || v === '1' || v === 1, z.boolean()).optional(),
  // note: featured/bestSeller/newArrival are not in Prisma Product model; omit them here
})

export type ProductInput = z.infer<typeof productSchema>
