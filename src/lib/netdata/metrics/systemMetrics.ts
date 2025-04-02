import { netdataAPI } from '../netdataAPI'
import { MetricsResponse, NetdataApiParams, NetdataContexts } from '../types'
import { formatTimestamp, getTimeSeriesData } from '../utils'

export interface ServerLoadData {
  timestamp: string
  fullTimestamp: string
  load1m: number
  load5m: number
  load15m: number
}

export interface ServerUptimeData {
  timestamp: string
  fullTimestamp: string
  uptime: string
}
/**
 * Retrieves server load metrics.
 */
export const getServerLoad = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<
  MetricsResponse<{
    overview: {
      timestamp: string
      fullTimestamp: string
      load1m: number
      load5m: number
      load15m: number
    }[]
    detailed: any[]
  }>
> => {
  const result = await getTimeSeriesData<any>(
    params,
    NetdataContexts.LOAD,
    undefined,
    minutes,
  )

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || 'Failed to retrieve server load data',
      data: undefined,
    }
  }

  const formattedData: ServerLoadData[] = result.data.data.map(
    (point: any) => ({
      timestamp: point.timestamp,
      fullTimestamp: point.fullTimestamp,
      load1m: parseFloat((point.load1 || 0).toFixed(2)),
      load5m: parseFloat((point.load5 || 0).toFixed(2)),
      load15m: parseFloat((point.load15 || 0).toFixed(2)),
    }),
  )

  return {
    success: true,
    message: 'Server load trend retrieved successfully',
    data: {
      overview: formattedData,
      detailed: formattedData,
    },
  }
}

/**
 * Retrieves server uptime metrics.
 */
export const getServerUptime = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<
  MetricsResponse<{
    overview: {
      timestamp: string
      fullTimestamp: string
      uptime: string
    }[]
    detailed: any[]
  }>
> => {
  const result = await getTimeSeriesData<any>(
    params,
    NetdataContexts.SERVER_UPTIME,
    undefined,
    minutes,
  )

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || 'Failed to retrieve server uptime data',
      data: undefined,
    }
  }

  const formatUptime = (uptimeInSeconds: number): { fullTimestamp: string } => {
    const days = Math.floor(uptimeInSeconds / 86400)
    const hours = Math.floor((uptimeInSeconds % 86400) / 3600)
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60)

    return {
      fullTimestamp: `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`, // d hh:mm
    }
  }

  const formattedData: ServerUptimeData[] = result.data.data.map(
    (point: any) => {
      const { fullTimestamp: uptime } = formatUptime(point.uptime)

      return {
        timestamp: point.timestamp,
        fullTimestamp: point.fullTimestamp,
        uptime,
      }
    },
  )

  return {
    success: true,
    message: 'Server uptime retrieved successfully',
    data: {
      overview: formattedData,
      detailed: formattedData,
    },
  }
}

export const getSystemAlerts = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<MetricsResponse<any>> => {
  const result = await netdataAPI(params, 'alarms')

  if (!result.status) {
    return {
      success: false,
      message: result.message || 'Failed to retrieve system alarms data',
      data: undefined,
    }
  }

  const { timestamp, fullTimestamp } = formatTimestamp(result.now, 1000)

  const alarms = Object.values(result.alarms) as any[]

  // Categorize alarms
  let criticalCount = 0
  let warningCount = 0
  let normalCount = 0

  const detailedData = alarms.map(alarm => {
    const isCritical = alarm.status === 'CRITICAL'
    const isWarning = alarm.status === 'WARNING'

    if (isCritical) criticalCount++
    if (isWarning) warningCount++
    if (!isCritical && !isWarning) normalCount++

    // Current timestamp for the data point
    const { timestamp, fullTimestamp } = formatTimestamp(
      alarm.last_updated,
      1000,
    )

    return {
      timestamp,
      fullTimestamp,
      name: alarm.name,
      type: alarm.type,
      status: alarm.status,
      summary: alarm.summary,
      info: alarm.info,
    }
  })

  return {
    success: true,
    message: 'System alerts retrieved successfully',
    data: {
      overview: {
        criticalCount,
        warningCount,
        normalCount,
      },
      detailed: { timestamp, fullTimestamp, alarms: detailedData },
    },
  }
}
