import { z } from 'zod'

// Schema for installing a terminal
export const installTerminalSchema = z.object({
  serverId: z.string({
    required_error: 'Server ID is required',
  }),
})

// Schema for uninstalling a terminal
export const uninstallTerminalSchema = z.object({
  serverId: z.string({
    required_error: 'Server ID is required',
  }),
})

// Schema for starting a terminal
export const startTerminalSchema = z.object({
  serverId: z.string({
    required_error: 'Server ID is required',
  }),
})

// Schema for stopping a terminal
export const stopTerminalSchema = z.object({
  serverId: z.string({
    required_error: 'Server ID is required',
  }),
})

// Schema for restarting a terminal
export const restartTerminalSchema = z.object({
  serverId: z.string({
    required_error: 'Server ID is required',
  }),
})

// Optional: Schema for accessing terminal with token/credentials
export const accessTerminalSchema = z.object({
  serverId: z.string({
    required_error: 'Server ID is required',
  }),
  token: z.string().optional(),
})

// Optional: Schema for configuring terminal settings
export const configureTerminalSchema = z.object({
  serverId: z.string({
    required_error: 'Server ID is required',
  }),
  settings: z
    .object({
      port: z.number().optional(),
      timeoutMinutes: z.number().optional(),
      allowedIPs: z.array(z.string()).optional(),
      requireAuth: z.boolean().optional(),
    })
    .optional(),
})
