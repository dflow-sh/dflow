import { z } from 'zod'

export const connectDFlowAccountSchema = z.object({
  accessToken: z.string().min(1),
  name: z.string().min(1),
  id: z.string().optional(),
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

export const createSshKeysAndVpsActionSchema = z.object({
  accountId: z.string(),
  sshKeyIds: z.array(z.string()),
  vps: z.object({
    plan: z.string(),
    displayName: z.string(),
    image: z.object({
      imageId: z.string(),
      priceId: z.string(),
    }),
    product: z.object({
      productId: z.string(),
      priceId: z.string(),
    }),
    region: z.object({
      code: z.string(),
      priceId: z.string(),
    }),
    defaultUser: z.literal('root'),
    rootPassword: z.number(),
    period: z.object({
      months: z.literal(1),
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
  accountId: z.string().min(1, 'Account ID is required'),
})
