import { MetricsResponse, NetdataApiParams } from '../types'
import { getTimeSeriesData } from '../utils'

/**
 * Retrieves CPU utilization trend data
 *
 * @param {NetdataApiParams} params - Parameters for fetching metrics
 * @param {number} [points=24] - Number of data points to retrieve
 * @returns {Promise<MetricsResponse<any>>} CPU utilization metrics
 * @description Calculates total CPU usage percentage across all cores
 */
export const getCpuUtilization = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'system.cpu', points)

  if (!result.success) return result

  const formattedData = result?.data!.map((point: any) => {
    let totalUsage = 0

    // Dynamically process all available CPU states
    for (const [key, value] of Object.entries(point)) {
      // Skip the 'time' field and 'idle' if it exists
      if (key !== 'time' && key !== 'idle' && typeof value === 'number') {
        totalUsage += value
      }
    }

    // If 'idle' is present, use it for the calculation (100 - idle)
    if (point.idle !== undefined && typeof point.idle === 'number') {
      totalUsage = 100 - point.idle
    }

    // Ensure the usage is within 0-100 range
    totalUsage = Math.min(100, Math.max(0, totalUsage))

    return {
      time: point.time,
      usage: parseFloat(totalUsage.toFixed(1)),
    }
  })

  // Get the latest CPU utilization
  const latestUtilization =
    formattedData && formattedData.length > 0 ? formattedData.at(-1) : 0

  return {
    success: true,
    message: 'CPU utilization trend retrieved successfully',
    data: {
      overview: formattedData,
      detailed: result.data,
      latest: latestUtilization,
    },
  }
}

/**
 * Retrieves CPU pressure trend data
 *
 * @param {NetdataApiParams} params - Parameters for fetching metrics
 * @param {number} [points=24] - Number of data points to retrieve
 * @returns {Promise<MetricsResponse<any>>} CPU pressure metrics
 * @description Measures the pressure or contention for CPU resources
 */
export const getCpuPressure = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(
    params,
    'system.cpu_some_pressure',
    points,
  )
  if (!result.success) return result as any

  const formattedData = result?.data!.map((point: any) => ({
    time: point.time,
    pressure: parseFloat((point.value || 0).toFixed(1)),
  }))

  // Get the latest CPU pressure
  const latestPressure =
    formattedData && formattedData.length > 0 ? formattedData.at(-1) : 0

  return {
    success: true,
    message: 'CPU pressure trend retrieved successfully',
    data: {
      overview: formattedData,
      detailed: result.data,
      latest: latestPressure,
    },
  }
}

/**
 * Retrieves CPU pressure stall time trend data
 *
 * @param {NetdataApiParams} params - Parameters for fetching metrics
 * @param {number} [points=24] - Number of data points to retrieve
 * @returns {Promise<MetricsResponse<any>>} CPU pressure stall time metrics
 * @description Measures the total time tasks are stalled waiting for CPU resources
 */
export const getCpuPressureStallTime = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(
    params,
    'system.cpu_some_pressure_stall_time',
    points,
  )
  if (!result.success) return result as any

  const formattedData = result?.data!.map((point: any) => ({
    time: point.time,
    stallTime: parseFloat((point.value || 0).toFixed(1)),
  }))

  // Get the latest CPU pressure stall time
  const latestStallTime =
    formattedData && formattedData.length > 0 ? formattedData.at(-1) : 0

  return {
    success: true,
    message: 'CPU pressure stall time trend retrieved successfully',
    data: {
      overview: formattedData,
      detailed: result.data,
      latest: latestStallTime,
    },
  }
}
