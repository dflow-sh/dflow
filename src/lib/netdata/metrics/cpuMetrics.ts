import { MetricsResponse, NetdataApiParams } from '../types'
import { getTimeSeriesData } from '../utils'

export const getCpuUsageDistribution = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'system.cpu', points)
  if (!result.success) return result as any

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    user: point.user || 0,
    system: point.system || 0,
    idle: point.idle || 0,
    iowait: point.iowait || 0,
    nice: point.nice || 0,
    steal: point.steal || 0,
    guest: point.guest || 0,
  }))

  const latest = detailedData[detailedData.length - 1]
  const totalUsage = 100 - (latest.idle || 0)

  return {
    success: true,
    message: 'CPU usage distribution retrieved successfully',
    data: {
      overview: { usage: parseFloat(totalUsage.toFixed(1)) },
      detailed: detailedData,
    },
  }
}

export const getCpuTemperature = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'sensors.temperature', points)
  if (!result.success) return result as any

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    temperature: point.temperature || point.temp || 0,
  }))

  return {
    success: true,
    message: 'CPU temperature retrieved successfully',
    data: {
      overview: {
        temperature: detailedData[detailedData.length - 1].temperature,
      },
      detailed: detailedData,
    },
  }
}
