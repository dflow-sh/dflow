import { z } from 'zod'

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: 'Username is required' })
    .default('root'),
  rootPassword: z.number().default(141086),
  sshKeyIds: z.array(z.string()),
})

export const dflowVpsSchema = z.object({
  displayName: z
    .string()
    .min(1, { message: 'Display name is required' })
    .max(255, { message: 'Display name must be 255 characters or less' }),
  pricing: z.object({
    id: z.string().min(1, { message: 'Pricing plan is required' }),
    priceId: z.string().min(1, { message: 'priceId is required' }),
    termLength: z
      .number()
      .min(1, { message: 'Term length must be at least 1 month' })
      .max(12, { message: 'Term length cannot exceed 12 months' }),
  }),
  region: z.object({
    name: z.string().min(1, { message: 'Region is required' }),
    priceId: z.string().min(1, { message: 'PriceId is required' }),
  }),
  storageType: z.object({
    productId: z.string().min(1, { message: 'Storage type is required' }),
    priceId: z.string().min(1, { message: 'PriceId is required' }),
  }),
  image: z.object({
    imageId: z.string().min(1, { message: 'Image is required' }),
    versionId: z.string().min(1, { message: 'Image version is required' }),
    priceId: z.string().min(1, { message: 'PriceId is required' }),
  }),
  login: loginSchema,
  backup: z.object({
    id: z.string().min(1, { message: 'Backup option is required' }),
    priceId: z.string().min(1, { message: 'PriceId is required' }),
  }),
})

export type VpsFormData = z.infer<typeof dflowVpsSchema>
