import { MetricsResponse, NetdataApiParams } from '../types'
import { getTimeSeriesData } from '../utils'

export const getWebRequests = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const webServers = ['nginx', 'apache', 'web']
  let result = null
  for (const server of webServers) {
    const temp = await getTimeSeriesData(params, `${server}.requests`, points)
    if (temp.success) {
      result = temp
      break
    }
  }
  if (!result)
    return { success: false, message: 'No web metrics available' } as any

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    success: point.success || point['2xx'] || point.requests || 0,
    clientErrors: point['4xx'] || 0,
    serverErrors: point['5xx'] || 0,
  }))

  return {
    success: true,
    message: 'Web requests retrieved successfully',
    data: {
      overview: {
        requestRate: detailedData[detailedData.length - 1].success,
      },
      detailed: detailedData,
    },
  }
}

export const getResponseTimes = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const webServers = ['nginx', 'apache', 'web']
  let result = null
  for (const server of webServers) {
    const temp = await getTimeSeriesData(
      params,
      `${server}.response_time`,
      points,
    )
    if (temp.success) {
      result = temp
      break
    }
  }
  if (!result)
    return {
      success: false,
      message: 'No response time metrics available',
    } as any

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    responseTime:
      (point.response_time || point.avg || 0) *
      (point.response_time < 10 ? 1000 : 1),
  }))

  return {
    success: true,
    message: 'Response times retrieved successfully',
    data: {
      overview: {
        avgResponseMs: Math.round(
          detailedData[detailedData.length - 1].responseTime,
        ),
      },
      detailed: detailedData,
    },
  }
}
