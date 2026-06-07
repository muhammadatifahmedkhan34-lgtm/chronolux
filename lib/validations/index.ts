import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const addressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(4),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(1),
})

export const dummyCardSchema = z.object({
  cardholderName: z.string().min(1, 'Cardholder name is required'),
  cardNumber: z.string().regex(/^[0-9]{16}$/, 'Card number must be exactly 16 digits'),
  expiry: z.string().refine((val) => {
    if (typeof val !== 'string') return false
    const m = val.match(/^(\d{2})\/(\d{2}|\d{4})$/)
    if (!m) return false
    const month = parseInt(m[1], 10)
    let year = parseInt(m[2], 10)
    if (m[2].length === 2) year += 2000
    if (month < 1 || month > 12) return false
    // card is valid through the end of the month. build a date representing
    // the first day of the month after the expiry month and compare to now
    const expiryEnd = new Date(year, month, 1)
    return expiryEnd > new Date()
  }, 'Expiry must be MM/YY or MM/YYYY, month 01-12, and not in the past'),
  cvv: z.string().regex(/^[0-9]{3}$/, 'CVV must be exactly 3 digits'),
})

export const checkoutSchema = z.object({
  paymentMethod: z.enum(['CASH_ON_DELIVERY','DUMMY_CARD']),
  address: addressSchema,
  // server-side should not require or store sensitive card details.
  // accept only an optional cardholder name for records (no PAN/CVV/expiry)
  card: z.object({ cardholderName: z.string().min(1).optional() }).optional(),
  couponCode: z.string().min(1).optional(),
  idempotencyKey: z.string().min(1).max(128).optional()
})

export const couponCreateSchema = z.object({
  code: z.string().min(1),
  discountType: z.enum(['PERCENTAGE','FIXED']),
  discountValue: z.number().int().nonnegative(),
  minimumOrderAmount: z.number().int().nonnegative().optional(),
  usageLimit: z.number().int().nonnegative().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const couponValidateSchema = z.object({
  code: z.string().min(1),
})

export const reviewCreateSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(2000),
})
