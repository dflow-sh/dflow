import { MetricsResponse, NetdataApiParams } from '../types'
import { getTimeSeriesData, netdataAPI } from '../utils'

// Define specific data types for clarity
interface DiskSpaceData {
  time: string
  used: number
  avail: number
}

interface DiskIOData {
  time: string
  reads: number // KB/s
  writes: number // KB/s
}

interface DiskVolumeData {
  name: string
  used: number
  total: number
}

export const getDiskSpaceUsage = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<
  MetricsResponse<{
    overview: { usedPercent: number }
    detailed: DiskSpaceData[]
  }>
> => {
  const result = await getTimeSeriesData(params, 'system.storage', points)
  if (!result.success) {
    return {
      success: false,
      message: result.message || 'Failed to retrieve disk space usage',
      data: { overview: { usedPercent: 0 }, detailed: [] }, // Provide default data structure
    }
  }

  const detailedData: DiskSpaceData[] = result.data!.map((point: any) => ({
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

export const getDiskIO = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<
  MetricsResponse<{
    overview: { readKbps: number; writeKbps: number }
    detailed: DiskIOData[]
  }>
> => {
  const result = await getTimeSeriesData(params, 'system.io', points)
  if (!result.success) {
    return {
      success: false,
      message: result.message || 'Failed to retrieve disk I/O',
      data: { overview: { readKbps: 0, writeKbps: 0 }, detailed: [] }, // Provide default data structure
    }
  }

  const detailedData: DiskIOData[] = result.data!.map((point: any) => ({
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

export const getDiskVolumes = async (
  params: NetdataApiParams,
): Promise<MetricsResponse<DiskVolumeData[]>> => {
  try {
    const volumes = await Promise.all([
      netdataAPI(params, 'data?chart=disk_space._'), // Root filesystem
      netdataAPI(params, 'data?chart=disk_space._mnt_data'), // Data mount point
      // Add more volumes as needed, e.g., 'disk_space._mnt_backup'
    ])

    const volumeData: DiskVolumeData[] = volumes
      .map((data, i) => {
        const latest = data.data[data.data.length - 1]
        const usedIndex = data.labels.indexOf('used')
        const availIndex = data.labels.indexOf('avail')
        const used = usedIndex !== -1 ? latest[usedIndex] : 0
        const avail = availIndex !== -1 ? latest[availIndex] : 0
        return {
          name: ['Root', 'Data'][i] || `Volume ${i + 1}`, // Fallback naming
          used,
          total: used + avail,
        }
      })
      .filter(volume => volume.total > 0) // Filter out invalid volumes

    return {
      success: true,
      message: 'Disk volumes retrieved successfully',
      data: volumeData,
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to retrieve disk volumes: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: [], // Default empty array for consistency
    }
  }
}
