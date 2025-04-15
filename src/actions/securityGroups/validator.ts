import { z } from 'zod'

// Define Protocol type
const protocolSchema = z.union([
  z.literal('all'),
  z.literal('tcp'),
  z.literal('udp'),
  z.literal('icmp'),
  z.literal('icmpv6'),
  z.string(), // For custom protocols
])

// Updated inbound rules schema
const inboundRulesSchema = z
  .object({
    description: z.string().optional(),
    type: z.enum([
      'all-traffic',
      'all-tcp',
      'all-udp',
      'ssh',
      'http',
      'https',
      'custom-tcp',
      'custom-udp',
      'icmp',
      'icmpv6',
      'smtp',
      'pop3',
      'imap',
      'ms-sql',
      'mysql-aurora',
      'postgresql',
      'dns-udp',
      'rdp',
      'nfs',
      'custom-protocol',
    ]),
    protocol: protocolSchema,
    fromPort: z.number().min(-1).max(65535).optional(), // -1 is valid for certain protocols
    toPort: z.number().min(-1).max(65535).optional(), // -1 is valid for certain protocols
    sourceType: z.enum(['my-ip', 'anywhere-ipv4', 'anywhere-ipv6', 'custom']),
    source: z.string(),
    securityGroupRuleId: z.string().optional(),
  })
  .refine(
    data => {
      // For ICMP types, ports can be -1 or undefined
      if (['icmp', 'icmpv6', 'all-traffic'].includes(data.type)) {
        return true
      }
      // All other types need port ranges if defined
      return (
        (data.fromPort === undefined && data.toPort === undefined) ||
        (data.fromPort !== undefined && data.toPort !== undefined)
      )
    },
    {
      message:
        'Both fromPort and toPort must be provided together for TCP/UDP rules',
      path: ['fromPort'],
    },
  )

// Updated outbound rules schema
const outboundRulesSchema = z
  .object({
    description: z.string().optional(),
    type: z.enum([
      'all-traffic',
      'all-tcp',
      'all-udp',
      'ssh',
      'http',
      'https',
      'custom-tcp',
      'custom-udp',
      'icmp',
      'icmpv6',
      'smtp',
      'pop3',
      'imap',
      'ms-sql',
      'mysql-aurora',
      'postgresql',
      'dns-udp',
      'rdp',
      'nfs',
      'custom-protocol',
    ]),
    protocol: protocolSchema,
    fromPort: z.number().min(-1).max(65535).optional(), // -1 is valid for certain protocols
    toPort: z.number().min(-1).max(65535).optional(), // -1 is valid for certain protocols
    destinationType: z.enum([
      'my-ip',
      'anywhere-ipv4',
      'anywhere-ipv6',
      'custom',
    ]),
    destination: z.string(),
    securityGroupRuleId: z.string().optional(),
  })
  .refine(
    data => {
      // For ICMP types, ports can be -1 or undefined
      if (['icmp', 'icmpv6', 'all-traffic'].includes(data.type)) {
        return true
      }
      // All other types need port ranges if defined
      return (
        (data.fromPort === undefined && data.toPort === undefined) ||
        (data.fromPort !== undefined && data.toPort !== undefined)
      )
    },
    {
      message:
        'Both fromPort and toPort must be provided together for TCP/UDP rules',
      path: ['fromPort'],
    },
  )

// Tags schema remains the same
const tagsSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string().optional(),
})

// Schema for creating a security group
export const createSecurityGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  cloudProvider: z.enum(['aws', 'azure', 'gcp', 'digitalocean']).optional(),
  cloudProviderAccount: z.string().optional(),
  inboundRules: z.array(inboundRulesSchema).optional().default([]),
  outboundRules: z.array(outboundRulesSchema).optional().default([]),
  tags: z.array(tagsSchema).optional().default([]),
})

// Schema for updating a security group
export const updateSecurityGroupSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  cloudProvider: z.enum(['aws', 'azure', 'gcp', 'digitalocean']).optional(),
  cloudProviderAccount: z
    .string()
    .min(1, 'Cloud Provider Account is required')
    .optional(),
  inboundRules: z.array(inboundRulesSchema).optional(),
  outboundRules: z.array(outboundRulesSchema).optional(),
  tags: z.array(tagsSchema).optional(),
})

export const deleteSecurityGroupSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})

export const getSecurityGroupsSchema = z.object({
  cloudProviderAccountId: z.string(),
})
