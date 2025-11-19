import { z } from 'zod'

export const uninstallNetdataSchema = z.object({
  serverId: z.string({
    required_error: 'Server ID is required',
  }),
})

export const installNetdataSchema = z.object({
  serverId: z.string({
    required_error: 'Server ID is required',
  }),
})
