import { MetricsResponse, NetdataApiParams } from '../types'
import { getTimeSeriesData } from '../utils'

export const getServerLoad = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'system.load', points)
  if (!result.success) return result as any

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    load1: point.load1 || 0,
    load5: point.load5 || 0,
    load15: point.load15 || 0,
  }))

  return {
    success: true,
    message: 'Server load retrieved successfully',
    data: {
      overview: {
        load1: parseFloat(
          detailedData[detailedData.length - 1].load1.toFixed(1),
        ),
      },
      detailed: detailedData,
    },
  }
}

export const getSystemAlerts = async (
  params: NetdataApiParams,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'system.alarms')
  if (!result.success) return result as any

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    critical: point.critical || 0,
    warning: point.warning || 0,
    normal: point.normal || 0,
  }))

  return {
    success: true,
    message: 'System alerts retrieved successfully',
    data: {
      overview: {
        criticalCount: detailedData[detailedData.length - 1].critical,
      },
      detailed: detailedData,
    },
  }
}
