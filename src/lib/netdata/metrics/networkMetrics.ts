import { MetricsResponse, NetdataApiParams } from '../types'
import { getTimeSeriesData, netdataAPI } from '../utils'

export const getNetworkTraffic = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'system.net', points)
  if (!result.success) return result as any

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    incoming: Math.abs(point.received || 0) / (1024 * 1024),
    outgoing: Math.abs(point.sent || 0) / (1024 * 1024),
  }))

  const latest = detailedData[detailedData.length - 1]
  return {
    success: true,
    message: 'Network traffic retrieved successfully',
    data: {
      overview: {
        incomingMbps: parseFloat(latest.incoming.toFixed(2)),
        outgoingMbps: parseFloat(latest.outgoing.toFixed(2)),
      },
      detailed: detailedData,
    },
  }
}

export const getNetworkPackets = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'system.packets', points)
  if (!result.success) return result as any

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    received: point.received || 0,
    sent: point.sent || 0,
    errors: point.errors || 0,
    dropped: point.dropped || 0,
  }))

  return {
    success: true,
    message: 'Network packets retrieved successfully',
    data: {
      overview: {
        errorRate: detailedData[detailedData.length - 1].errors,
      },
      detailed: detailedData,
    },
  }
}

export const getNetworkErrors = async (params: NetdataApiParams) => {
  const response = await netdataAPI(params, 'data?chart=net_errors.eth0')
  return response.data.map((point: number[], i: number) => ({
    time: new Date(response.after + i * response.point).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    dropped: point[response.labels.indexOf('dropped')],
    errors: point[response.labels.indexOf('errors')],
  }))
}
