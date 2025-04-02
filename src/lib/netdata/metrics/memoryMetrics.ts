import { MetricsResponse, NetdataApiParams, NetdataContexts } from '../types'
import { getTimeSeriesData } from '../utils'

/**
 * Retrieves RAM usage metrics.
 */
export const getMemoryUsage = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(
    params,
    NetdataContexts.RAM,
    undefined,
    minutes,
  )

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || 'Failed to retrieve RAM usage data',
      data: undefined,
    }
  }

  const formattedData = result.data.data.map((point: any) => {
    const totalMemory = point.used + point.free + point.cached + point.buffers
    const usage = totalMemory > 0 ? (point.used / totalMemory) * 100 : 0

    return {
      timestamp: point.timestamp,
      fullTimestamp: point.fullTimestamp,
      used: point.used || 0,
      free: point.free || 0,
      cached: point.cached || 0,
      buffers: point.buffers || 0,
      usage, // Add calculated usage
    }
  })

  // Overview data with only timestamp and usage
  const overview = formattedData.map(point => ({
    timestamp: point.timestamp,
    fullTimestamp: point.fullTimestamp,
    usage: point.usage,
  }))

  return {
    success: true,
    message: 'RAM usage retrieved successfully',
    data: {
      overview,
      detailed: formattedData,
    },
  }
}

/**
 * Retrieves available memory metrics.
 */
export const getMemoryAvailable = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(
    params,
    NetdataContexts.MEMORY_AVAILABLE,
    undefined,
    minutes,
  )

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || 'Failed to retrieve available memory data',
      data: undefined,
    }
  }

  const formattedData = result.data.data.map((point: any) => ({
    timestamp: point.timestamp,
    fullTimestamp: point.fullTimestamp,
    available: point.avail || 0,
  }))

  return {
    success: true,
    message: 'Available memory retrieved successfully',
    data: {
      overview: formattedData,
      detailed: formattedData,
    },
  }
}

/**
 * Retrieves memory pressure metrics.
 */
export const getMemorySomePressure = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(
    params,
    NetdataContexts.MEMORY_SOME_PRESSURE,
    undefined,
    minutes,
  )

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || 'Failed to retrieve memory pressure data',
      data: undefined,
    }
  }

  const formattedData = result.data.data.map((point: any) => ({
    timestamp: point.timestamp,
    fullTimestamp: point.fullTimestamp,
    some10: parseFloat((point['some 10'] || 0).toFixed(1)),
    some60: parseFloat((point['some 60'] || 0).toFixed(1)),
    some300: parseFloat((point['some 300'] || 0).toFixed(1)),
  }))

  return {
    success: true,
    message: 'Memory pressure trend retrieved successfully',
    data: {
      overview: formattedData,
      detailed: formattedData,
    },
  }
}

/**
 * Retrieves memory pressure stall time metrics.
 */
export const getMemorySomePressureStallTime = async (
  params: NetdataApiParams,
  minutes = 30,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(
    params,
    NetdataContexts.MEMORY_PRESSURE_STALL_TIME,
    undefined,
    minutes,
  )

  if (!result.success || !result.data) {
    return {
      success: false,
      message:
        result.message || 'Failed to retrieve memory pressure stall time data',
      data: undefined,
    }
  }

  const formattedData = result.data.data.map((point: any) => ({
    timestamp: point.timestamp,
    fullTimestamp: point.fullTimestamp,
    stallTime: parseFloat((point.time || 0).toFixed(1)),
  }))

  return {
    success: true,
    message: 'Memory pressure stall time trend retrieved successfully',
    data: {
      overview: formattedData,
      detailed: formattedData,
    },
  }
}
