import { z } from 'zod'

export const connectAWSAccountSchema = z.object({
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  name: z.string().min(1),
  id: z.string().optional(),
})

export const deleteAWSAccountSchema = z.object({
  id: z.string(),
})

export const createEC2InstanceSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  sshKeyId: z.string(),
  accountId: z.string(),
  region: z.string(),
  ami: z.string(),
  instanceType: z.string(),
  diskSize: z.number().min(30),
  securityGroupIds: z.array(z.string()).optional(),
})
