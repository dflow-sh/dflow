import { MetricsResponse, NetdataApiParams } from '../types'
import { getTimeSeriesData } from '../utils'

/**
 * Retrieves disk space usage data
 *
 * @param {NetdataApiParams} params - Parameters for fetching metrics
 * @param {number} [minutes] - Number of data points to retrieve
 * @returns {Promise<MetricsResponse<any>>} Disk space usage metrics
 */
export const getDiskSpaceUsage = async (
  params: NetdataApiParams,
  minutes?: number,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'disk.space', minutes, 'v2')
  console.log({ result })
  if (!result.success) return result

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    used: point.used || 0,
    avail: point.avail || 0,
  }))

  const latest = detailedData[detailedData.length - 1]
  const total = latest.used + latest.avail
  const usedPercent = total > 0 ? Math.round((latest.used / total) * 100) : 0

  return {
    success: true,
    message: 'Disk space usage retrieved successfully',
    data: {
      overview: { usedPercent },
      detailed: detailedData,
    },
  }
}

/**
 * Retrieves disk I/O statistics
 *
 * @param {NetdataApiParams} params - Parameters for fetching metrics
 * @param {number} [minutes] - Number of data points to retrieve
 * @returns {Promise<MetricsResponse<any>>} Disk I/O metrics
 */
export const getDiskIO = async (
  params: NetdataApiParams,
  minutes?: number,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'disk.io', minutes, 'v2')
  if (!result.success) return result

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    reads: Math.abs(point.reads || 0) / 1024, // Convert from bytes/s to KB/s
    writes: Math.abs(point.writes || 0) / 1024, // Convert from bytes/s to KB/s
  }))

  return {
    success: true,
    message: 'Disk I/O retrieved successfully',
    data: {
      overview: {
        readKbps: parseFloat(
          detailedData[detailedData.length - 1].reads.toFixed(2),
        ),
        writeKbps: parseFloat(
          detailedData[detailedData.length - 1].writes.toFixed(2),
        ),
      },
      detailed: detailedData,
    },
  }
}

/**
 * Retrieves system-wide I/O statistics
 *
 * @param {NetdataApiParams} params - Parameters for fetching metrics
 * @param {number} [minutes] - Number of data points to retrieve
 * @returns {Promise<MetricsResponse<any>>} System I/O metrics
 */
export const getSystemIO = async (
  params: NetdataApiParams,
  minutes?: number,
): Promise<MetricsResponse<any>> => {
  const result = await getTimeSeriesData(params, 'system.io', minutes)
  if (!result.success) return result

  const detailedData = result.data!.map((point: any) => ({
    time: point.time,
    reads: Math.abs(point.reads || 0) / 1024, // Convert from bytes/s to KB/s
    writes: Math.abs(point.writes || 0) / 1024, // Convert from bytes/s to KB/s
  }))

  return {
    success: true,
    message: 'System I/O retrieved successfully',
    data: {
      overview: {
        readKbps: parseFloat(
          detailedData[detailedData.length - 1].reads.toFixed(2),
        ),
        writeKbps: parseFloat(
          detailedData[detailedData.length - 1].writes.toFixed(2),
        ),
      },
      detailed: detailedData,
    },
  }
}
