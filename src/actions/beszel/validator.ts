import { z } from 'zod'

const StatTypeEnum = z.enum(['1m', '10m', '20m', '120m', '480m'])

export const installMonitoringToolsSchema = z.object({
  serverId: z.string(),
})

export const getSystemStatsSchema = z.object({
  serverName: z.string(),
  host: z.string(),
  type: StatTypeEnum,
  from: z.string(),
})
