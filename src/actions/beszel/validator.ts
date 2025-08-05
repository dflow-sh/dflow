import { z } from 'zod'

export const installMonitoringToolsSchema = z.object({
  serverId: z.string(),
})
