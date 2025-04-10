import { z } from 'zod'

const inboundRulesSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum([
    'all-traffic',
    'custom-tcp',
    'custom-udp',
    'custom-icmp',
    'ssh',
    'https',
    'http',
    'rdp',
    'custom',
  ]),
  protocol: z.enum(['tcp', 'udp', 'icmp', 'all']),
  fromPort: z.number().min(0).max(65535),
  toPort: z.number().min(0).max(65535),
  sourceType: z.enum(['my-ip', 'anywhere-ipv4', 'anywhere-ipv6', 'custom']),
  source: z.string(),
})

const outboundRulesSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum([
    'all-traffic',
    'custom-tcp',
    'custom-udp',
    'custom-icmp',
    'ssh',
    'https',
    'http',
    'rdp',
    'custom',
  ]),
  protocol: z.enum(['tcp', 'udp', 'icmp', 'all']),
  fromPort: z.number().min(0).max(65535),
  toPort: z.number().min(0).max(65535),
  destinationType: z.enum([
    'my-ip',
    'anywhere-ipv4',
    'anywhere-ipv6',
    'custom',
  ]),
  destination: z.string(),
})

const tagsSchema = z.object({
  key: z.string(),
  value: z.string().optional(),
})

// Schema for creating a security group
export const createSecurityGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  cloudProvider: z.enum(['aws', 'azure', 'gcp', 'digitalocean']),
  cloudProviderAccount: z.string().min(1, 'Cloud Provider Account is required'),
  inboundRules: z.array(inboundRulesSchema).optional(),
  outboundRules: z.array(outboundRulesSchema).optional(),
  tags: z.array(tagsSchema).optional(),
})

// Schema for updating a security group
export const updateSecurityGroupSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  cloudProvider: z.enum(['aws', 'azure', 'gcp', 'digitalocean']).optional(),
  cloudProviderAccount: z.string().min(1, 'Cloud Provider Account is required'),
  inboundRules: z.array(inboundRulesSchema.partial()).optional(),
  outboundRules: z.array(outboundRulesSchema.partial()).optional(),
  tags: z.array(tagsSchema).optional(),
})

// No changes needed for deleteSecurityGroupSchema
export const deleteSecurityGroupSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})
