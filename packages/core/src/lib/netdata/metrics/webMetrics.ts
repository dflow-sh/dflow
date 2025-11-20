import { netdataAPI } from '../netdataAPI'
import { MetricsResponse, NetdataApiParams } from '../types'
import { getTimeSeriesData } from '../utils'

// Define specific data types for clarity
interface WebRequestData {
  timestamp: string
  success: number
  clientErrors: number
  serverErrors: number
}

interface ResponseTimeData {
  time: string
  responseTime: number
}

interface StatusCodeData {
  name: string
  value: number
}

export const getWebRequests = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<
  MetricsResponse<{
    overview: { requestRate: number }
    detailed: WebRequestData[]
  }>
> => {
  const webServers = ['nginx', 'apache', 'web']
  let result = null

  for (const server of webServers) {
    const temp = await getTimeSeriesData(
      params,
      `${server}.requests`,
      undefined,
      points,
    )
    if (temp.success) {
      result = temp
      break
    }
  }

  if (!result) {
    return { success: false, message: 'No web metrics available' }
  }

  const detailedData: any = result.data?.data.map((point: any) => ({
    timestamp: point.time,
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
): Promise<
  MetricsResponse<{
    overview: { avgResponseMs: number }
    detailed: ResponseTimeData[]
  }>
> => {
  const webServers = ['nginx', 'apache', 'web']
  let result = null

  for (const server of webServers) {
    const temp = await getTimeSeriesData(
      params,
      `${server}.response_time`,
      undefined,
      points,
    )
    if (temp.success) {
      result = temp
      break
    }
  }

  if (!result) {
    return { success: false, message: 'No response time metrics available' }
  }

  const detailedData: any = result.data?.data.map((point: any) => ({
    time: point.time,
    responseTime:
      (point.response_time || point.avg || 0) *
      (point.response_time < 10 ? 1000 : 1), // Convert to ms if value is in seconds
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

export const getRequestStatusCodes = async (
  params: NetdataApiParams,
): Promise<MetricsResponse<StatusCodeData[]>> => {
  try {
    const response = await netdataAPI(
      params,
      'data?chart=web_log_nginx.response_codes',
    )
    const latest = response.data[response.data.length - 1]
    const statusCodes: StatusCodeData[] = [
      { name: '200 OK', value: latest[response.labels.indexOf('2xx')] || 0 },
      {
        name: '301/302 Redirect',
        value: latest[response.labels.indexOf('3xx')] || 0,
      },
      {
        name: '404 Not Found',
        value: latest[response.labels.indexOf('4xx')] || 0,
      },
      {
        name: '500 Server Error',
        value: latest[response.labels.indexOf('5xx')] || 0,
      },
    ].filter(code => code.value > 0) // Filter out zero values

    return {
      success: true,
      message: 'Request status codes retrieved successfully',
      data: statusCodes,
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to retrieve status codes: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}
