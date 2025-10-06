import { z } from 'zod'

export const connectDFlowAccountSchema = z.object({
  accessToken: z.string().min(1),
  name: z.string().min(1),
})

export const updateDFlowAccountSchema = z.object({
  accessToken: z.string().min(1),
  name: z.string().min(1),
  id: z.string(),
})

export const getDFlowPlansActionSchema = z.object({ accessToken: z.string() })

export const createSshKeyActionSchema = z.object({
  token: z.string(),
  name: z.string(),
  publicSshKey: z.string(),
})

export const createVpsOrderActionSchema = z.object({
  token: z.string(),
  name: z.string(),
  sshKeys: z.array(z.number()),
})

export const createVPSOrderActionSchema = z.object({
  accountId: z.string(),
  sshKeyIds: z.array(z.string()).optional(),
  vps: z.object({
    plan: z.string(),
    displayName: z.string(),
    image: z.object({
      imageId: z.string(),
      priceId: z.string(),
    }),
    license: z
      .object({
        licenseCode: z.string().min(1, { message: 'License code is required' }),
        priceId: z.string().min(1, { message: 'PriceId is required' }),
      })
      .optional(),
    product: z.object({
      productId: z.string(),
      priceId: z.string(),
    }),
    region: z.object({
      code: z.string(),
      priceId: z.string(),
    }),
    defaultUser: z.string(),
    rootPassword: z.number(),
    period: z.object({
      months: z.number(),
      priceId: z.string(),
    }),
    addOns: z
      .object({
        backup: z.object({}).optional(),
        priceId: z.string(),
      })
      .partial()
      .optional(),
    estimatedCost: z.number(),
  }),
})

export const checkPaymentMethodSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export const checkConnectionSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export const deleteDFlowAccountSchema = z.object({
  id: z.string(),
})
