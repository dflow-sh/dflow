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
  sshKeys: z.array(
    z.object({
      name: z.string(),
      publicSshKey: z.string(),
      privateSshKey: z.string(),
    }),
  ),
  vps: z.object({
    name: z.string(),
  }),
})
