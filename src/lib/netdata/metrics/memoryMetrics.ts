import { MetricsResponse, NetdataApiParams } from '../types'
import { getTimeSeriesData } from '../utils'

export const getMemoryUsage = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'system.ram', points)
  if (!result.success) return result as any

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    used: point.used || 0,
    free: point.free || 0,
    cached: point.cached || 0,
    buffers: point.buffers || 0,
  }))

  const latest = detailedData[detailedData.length - 1]
  const total = latest.used + latest.free + latest.cached + latest.buffers
  const usedPercent = Math.round((latest.used / total) * 100)

  return {
    success: true,
    message: 'Memory usage retrieved successfully',
    data: {
      overview: { usagePercent: usedPercent },
      detailed: detailedData,
    },
  }
}

export const getSwapUsage = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'system.swap', points)
  if (!result.success) return result as any

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    used: point.used || 0,
    free: point.free || 0,
  }))

  const latest = detailedData[detailedData.length - 1]
  const total = latest.used + latest.free
  const usedPercent = total ? Math.round((latest.used / total) * 100) : 0

  return {
    success: true,
    message: 'Swap usage retrieved successfully',
    data: {
      overview: { usagePercent: usedPercent },
      detailed: detailedData,
    },
  }
}
