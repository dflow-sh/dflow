import { z } from 'zod'

export const createSecurityGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  region: z.string().min(1, 'Region is required'),
  groupId: z.string().min(1, 'Security Group ID is required'),
  ruleType: z.enum(['ingress', 'egress']),
  vpcId: z.string().optional(),
})

export const updateSecurityGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  region: z.string().min(1, 'Region is required'),
  groupId: z.string().min(1, 'Security Group ID is required'),
  ruleType: z.enum(['ingress', 'egress']),
  vpcId: z.string().optional(),
})

export const deleteSecurityGroupSchema = z.object({
  id: z.string(),
})

export const getSecurityGroupSchema = z.object({
  id: z.string(),
})
