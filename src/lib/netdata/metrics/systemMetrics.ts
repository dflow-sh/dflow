import { netdataAPI } from '../netdataAPI'
import { MetricsResponse, NetdataApiParams, NetdataContexts } from '../types'
import { getTimeSeriesData } from '../utils'

export interface ServerLoadData {
  timestamp: string
  load1m: number
  load5m: number
  load15m: number
}

export const getServerLoad = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<
  MetricsResponse<{
    overview: {
      timestamp: string
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
      message: result.message || 'Failed to retrieve system load data',
      data: undefined,
    }
  }

  const formattedData: ServerLoadData[] = result.data.data.map(
    (point: any) => ({
      timestamp: point.timestamp,
      load1m: parseFloat((point.load1 || 0).toFixed(2)),
      load5m: parseFloat((point.load5 || 0).toFixed(2)),
      load15m: parseFloat((point.load15 || 0).toFixed(2)),
    }),
  )

  // Create simplified overview (in this case it's the same structure as formattedData)
  const overview = formattedData.map(point => ({
    timestamp: point.timestamp,
    load1m: point.load1m,
    load5m: point.load5m,
    load15m: point.load15m,
  }))

  return {
    success: true,
    message: 'System load trend retrieved successfully',
    data: {
      overview,
      detailed: result.data.data,
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

  const now = new Date(result.now * 1000)
  const timeStr = now.toTimeString().substring(0, 8)

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
    const last_updated_date = new Date(alarm.last_updated * 1000)
    const lastUpdated = last_updated_date.toTimeString().substring(0, 8)

    return {
      lastUpdated,
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
      detailed: { timestamp: timeStr, alarms: detailedData },
    },
  }
}
