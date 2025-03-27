import { MetricsResponse, NetdataApiParams } from '../types'
import { getTimeSeriesData } from '../utils'

/**
 * Retrieves CPU utilization trend data
 *
 * @param {NetdataApiParams} params - Parameters for fetching metrics
 * @param {number} [minutes] - Number of data points to retrieve
 * @returns {Promise<MetricsResponse<any>>} CPU utilization metrics
 * @description Calculates total CPU usage percentage across all cores
 */
export const getCpuUtilization = async (
  params: NetdataApiParams,
  minutes?: number,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'system.cpu', minutes)
  if (!result.success) return result

  const formattedData = result?.data!.map((point: any) => {
    let totalUsage = 0
    for (const [key, value] of Object.entries(point)) {
      if (key !== 'time' && key !== 'idle' && typeof value === 'number') {
        totalUsage += value
      }
    }
    if (point.idle !== undefined && typeof point.idle === 'number') {
      totalUsage = 100 - point.idle
    }
    totalUsage = Math.min(100, Math.max(0, totalUsage))
    return {
      time: point.time,
      usage: parseFloat(totalUsage.toFixed(1)),
    }
  })

  return {
    success: true,
    message: 'CPU utilization trend retrieved successfully',
    data: {
      overview: formattedData,
      detailed: result.data,
    },
  }
}

/**
 * Retrieves CPU pressure trend data
 *
 * @param {NetdataApiParams} params - Parameters for fetching metrics
 * @param {number} [minutes] - Number of data points to retrieve
 * @returns {Promise<MetricsResponse<any>>} CPU pressure metrics
 * @description Measures the pressure or contention for CPU resources
 */
export const getCpuPressure = async (
  params: NetdataApiParams,
  minutes?: number,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(
    params,
    'system.cpu_some_pressure',
    minutes,
  )
  if (!result.success) return result as any

  const formattedData = result?.data!.map((point: any) => ({
    time: point.time,
    pressure: parseFloat((point.value || 0).toFixed(1)),
  }))

  return {
    success: true,
    message: 'CPU pressure trend retrieved successfully',
    data: {
      overview: formattedData,
      detailed: result.data,
    },
  }
}

/**
 * Retrieves CPU pressure stall time trend data
 *
 * @param {NetdataApiParams} params - Parameters for fetching metrics
 * @param {number} [minutes] - Number of data points to retrieve
 * @returns {Promise<MetricsResponse<any>>} CPU pressure stall time metrics
 * @description Measures the total time tasks are stalled waiting for CPU resources
 */
export const getCpuPressureStallTime = async (
  params: NetdataApiParams,
  minutes?: number,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(
    params,
    'system.cpu_some_pressure_stall_time',
    minutes,
  )
  if (!result.success) return result as any

  const formattedData = result?.data!.map((point: any) => ({
    time: point.time,
    stallTime: parseFloat((point.value || 0).toFixed(1)),
  }))

  return {
    success: true,
    message: 'CPU pressure stall time trend retrieved successfully',
    data: {
      overview: formattedData,
      detailed: result.data,
    },
  }
}

/**
 * Retrieves system load average data
 *
 * @param {NetdataApiParams} params - Parameters for fetching metrics
 * @param {number} [minutes] - Number of data points to retrieve
 * @returns {Promise<MetricsResponse<any>>} System load metrics
 * @description Retrieves 1-minute, 5-minute, and 15-minute system load averages
 */
export const getSystemLoad = async (
  params: NetdataApiParams,
  minutes?: number,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'system.load', minutes)
  if (!result.success) return result

  const formattedData = result?.data!.map((point: any) => ({
    time: point.time,
    load1m: parseFloat((point.load1 || 0).toFixed(2)),
    load5m: parseFloat((point.load5 || 0).toFixed(2)),
    load15m: parseFloat((point.load15 || 0).toFixed(2)),
  }))

  return {
    success: true,
    message: 'System load trend retrieved successfully',
    data: {
      overview: formattedData,
      detailed: result.data,
    },
  }
}

/**
 * Retrieves system uptime data
 *
 * @param {NetdataApiParams} params - Parameters for fetching metrics
 * @param {number} [minutes] - Number of data points to retrieve
 * @returns {Promise<MetricsResponse<any>>} System uptime metric
 * @description Fetches the total uptime of the system
 */
export const getSystemUptime = async (
  params: NetdataApiParams,
  minutes: number,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'system.uptime', minutes)
  if (!result.success) return result

  const formattedData = result?.data!.map((point: any) => ({
    time: point.time,
    uptimeSeconds: point.value || 0,
  }))

  return {
    success: true,
    message: 'System uptime retrieved successfully',
    data: {
      overview: formattedData,
      detailed: result.data,
    },
  }
}
