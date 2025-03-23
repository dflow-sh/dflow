import { MetricsResponse, NetdataApiParams } from '../types'
import { getTimeSeriesData } from '../utils'

export const getDiskSpaceUsage = async (
  params: NetdataApiParams,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'system.storage')
  if (!result.success) return result as any

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    used: point.used || 0,
    avail: point.avail || 0,
  }))

  const latest = detailedData[detailedData.length - 1]
  const total = latest.used + latest.avail
  const usedPercent = Math.round((latest.used / total) * 100)

  return {
    success: true,
    message: 'Disk space usage retrieved successfully',
    data: {
      overview: { usedPercent },
      detailed: detailedData,
    },
  }
}

export const getDiskIO = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'system.io', points)
  if (!result.success) return result as any

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    reads: Math.abs(point.reads || 0) / 1024,
    writes: Math.abs(point.writes || 0) / 1024,
  }))

  return {
    success: true,
    message: 'Disk I/O retrieved successfully',
    data: {
      overview: {
        readKbps: parseFloat(
          detailedData[detailedData.length - 1].reads.toFixed(2),
        ),
        writeKbps: parseFloat(
          detailedData[detailedData.length - 1].writes.toFixed(2),
        ),
      },
      detailed: detailedData,
    },
  }
}
