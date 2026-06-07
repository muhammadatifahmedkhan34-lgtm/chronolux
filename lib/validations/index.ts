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
  cardholderName: z.string().min(1),
  cardNumber: z.string().regex(/^[0-9]{16}$/),
  expiry: z.string().min(1),
  cvv: z.string().regex(/^[0-9]{3}$/),
})

export const checkoutSchema = z.object({
  paymentMethod: z.enum(['CASH_ON_DELIVERY','DUMMY_CARD']),
  address: addressSchema,
  card: dummyCardSchema.optional(),
})
