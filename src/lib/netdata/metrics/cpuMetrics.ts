import { MetricsResponse, NetdataApiParams, NetdataContexts } from '../types'
import { getTimeSeriesData } from '../utils'

// Define structured interfaces for metrics
export interface CPUMetricsData {
  timestamp: string
  utilization: number
  user?: number
  system?: number
  nice?: number
  idle?: number
  iowait?: number
  irq?: number
  softirq?: number
  steal?: number
  guest?: number
}

export interface CPUPressureData {
  timestamp: string
  pressure: number
}

export interface SystemLoadData {
  timestamp: string
  load1m: number
  load5m: number
  load15m: number
}

export interface SystemUptimeData {
  timestamp: string
  uptimeSeconds: number
}

/**
 * Calculates CPU utilization percentage from raw data.
 */
function calculateCPUUtilization(point: any): number {
  if (point.idle !== undefined) {
    return Math.min(100, Math.max(0, 100 - point.idle))
  }
  const nonIdleMetrics = [
    'user',
    'system',
    'nice',
    'iowait',
    'irq',
    'softirq',
    'steal',
    'guest',
  ]
  const totalUsage = nonIdleMetrics.reduce((sum, metric) => {
    return sum + (point[metric] || 0)
  }, 0)
  return Math.min(100, Math.max(0, parseFloat(totalUsage.toFixed(1))))
}

/**
 * Retrieves CPU utilization metrics.
 */
export const getCpuUtilization = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<
  MetricsResponse<{
    overview: { timestamp: string; usage: number }[]
    detailed: CPUMetricsData[]
  }>
> => {
  const result = await getTimeSeriesData<any>(
    params,
    NetdataContexts.CPU,
    undefined,
    minutes,
  )

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || 'Failed to retrieve CPU utilization data',
      data: undefined,
    }
  }

  // Transform the raw data using labels and data points
  const formattedData: CPUMetricsData[] = result.data.data.map(
    (point: any) => ({
      timestamp: point.timestamp,
      utilization: calculateCPUUtilization(point),
      ...Object.fromEntries(
        Object.entries(point)
          .filter(([key]) => key !== 'timestamp')
          .map(([key, value]) => [key, Number(value) || 0]),
      ),
    }),
  )

  // Create simplified overview data with timestamp and usage
  const overview = formattedData.map(point => ({
    timestamp: point.timestamp,
    usage: point.utilization,
  }))

  return {
    success: true,
    message: 'CPU utilization trend retrieved successfully',
    data: {
      overview,
      detailed: formattedData,
    },
  }
}

/**
 * Retrieves CPU pressure metrics.
 */
export const getCpuSomePressure = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(
    params,
    NetdataContexts.CPU_SOME_PRESSURE,
    undefined,
    minutes,
  )

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || 'Failed to retrieve CPU pressure data',
      data: undefined,
    }
  }

  const formattedData = result.data.data.map((point: any) => ({
    timestamp: point.timestamp,
    some10: parseFloat((point['some 10'] || 0).toFixed(1)),
    some60: parseFloat((point['some 60'] || 0).toFixed(1)),
    some300: parseFloat((point['some 300'] || 0).toFixed(1)),
  }))

  return {
    success: true,
    message: 'CPU pressure trend retrieved successfully',
    data: {
      overview: formattedData,
      detailed: formattedData,
    },
  }
}

/**
 * Retrieves CPU pressure stall time metrics.
 */
export const getCpuSomePressureStallTime = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(
    params,
    NetdataContexts.CPU_PRESSURE_STALL_TIME,
    undefined,
    minutes,
  )

  if (!result.success || !result.data) {
    return {
      success: false,
      message:
        result.message || 'Failed to retrieve CPU pressure stall time data',
      data: undefined,
    }
  }

  const formattedData = result.data.data.map((point: any) => ({
    timestamp: point.timestamp,
    stallTime: parseFloat((point.time || 0).toFixed(1)),
  }))

  return {
    success: true,
    message: 'CPU pressure stall time trend retrieved successfully',
    data: {
      overview: formattedData,
      detailed: formattedData,
    },
  }
}

/**
 * Retrieves system load metrics.
 */
export const getSystemLoad = async (
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

  const formattedData: SystemLoadData[] = result.data.data.map(
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

/**
 * Retrieves system uptime metrics.
 */
export const getSystemUptime = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<
  MetricsResponse<{
    overview: { timestamp: string; uptimeSeconds: number }[]
    detailed: any[]
  }>
> => {
  const result = await getTimeSeriesData<any>(
    params,
    NetdataContexts.SYSTEM_UPTIME,
    undefined,
    minutes,
  )

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || 'Failed to retrieve system uptime data',
      data: undefined,
    }
  }

  const formattedData: SystemUptimeData[] = result.data.data.map(
    (point: any) => ({
      timestamp: point.timestamp,
      uptimeSeconds: point.value || 0,
    }),
  )

  // Create simplified overview (same structure as formattedData in this case)
  const overview = formattedData.map(point => ({
    timestamp: point.timestamp,
    uptimeSeconds: point.uptimeSeconds,
  }))

  return {
    success: true,
    message: 'System uptime retrieved successfully',
    data: {
      overview,
      detailed: result.data.data,
    },
  }
}
