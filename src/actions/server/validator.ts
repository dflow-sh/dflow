import { z } from 'zod'

export const createServerSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name should be at-least than 1 character' })
    .max(50, { message: 'Name should be less than 50 characters' }),
  description: z.string().optional(),
  ip: z
    .string({ message: 'IP is required' })
    .ip({ message: 'Invalid IP address' }),
  port: z.number({ message: 'Port is required' }),
  username: z.string({ message: 'Username is required' }),
  sshKey: z.string({ message: 'SSH key is required' }),
})

export const createTailscaleServerSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Server name is required' })
    .max(50, { message: 'Server name should be less than 50 characters' }),
  description: z.string().optional(),
  hostname: z.string().min(1, 'Hostname is required'),
  username: z.string().min(1, 'Username is required'),
})

export const updateTailscaleServerSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Server name is required' })
    .max(50, { message: 'Server name should be less than 50 characters' }),
  description: z.string().optional(),
  hostname: z.string().min(1, 'Hostname is required'),
  username: z.string().min(1, 'Username is required'),
  id: z.string(),
})

export const updateServerSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name should be at-least than 1 character' })
    .max(50, { message: 'Name should be less than 50 characters' }),
  description: z.string().optional(),
  ip: z
    .string({ message: 'IP is required' })
    .ip({ message: 'Invalid IP address' }),
  port: z.number({ message: 'Port is required' }),
  username: z.string({ message: 'Username is required' }),
  sshKey: z.string({ message: 'SSH key is required' }),
  id: z.string(),
})

export const deleteServerSchema = z.object({
  id: z.string(),
  deleteProjects: z.boolean(),
  deleteBackups: z.boolean(),
})

export const installDokkuSchema = z.object({
  serverId: z.string(),
})

export const uninstallDokkuSchema = z.object({
  serverId: z.string(),
})

export const updateServerDomainSchema = z.object({
  domains: z.array(z.string()),
  operation: z.enum(['add', 'remove', 'set']),
  id: z.string(),
})

export const completeServerOnboardingSchema = z.object({
  serverId: z.string().min(1, 'Server ID is required'),
})

export const checkDNSConfigSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  ip: z.string().ip({ message: 'Invalid IP address' }),
  proxyDomain: z.string().optional(),
})

export const checkServerConnectionSchema = z.discriminatedUnion(
  'connectionType',
  [
    z.object({
      connectionType: z.literal('ssh'),
      ip: z.string().min(1, 'Server IP is required'),
      port: z.number().min(1).max(65535, 'Valid port number required'),
      username: z.string().min(1, 'Username is required'),
      privateKey: z.string().min(1, 'Private key is required'),
    }),
    z.object({
      connectionType: z.literal('tailscale'),
      hostname: z.string().min(1, 'Hostname is required'),
      username: z.string().min(1, 'Username is required'),
    }),
  ],
)

export const generateTailscaleHostnameSchema = z.object({
  hostname: z.string(),
})

export const configureGlobalBuildDirSchema = z.object({
  serverId: z.string(),
  buildDir: z.string().optional(),
})
