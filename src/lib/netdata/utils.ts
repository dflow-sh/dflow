import { netdataAPI } from './netdataAPI'
import {
  MetricsResponse,
  NetdataApiParams,
  NetdataContexts,
  SystemMetrics,
} from './types'

/**
 * Helper function to transform raw data based on labels
 * @param labels Array of metric labels from Netdata
 * @param dataPoints Raw data points from Netdata API
 * @param options Optional configuration for transformation
 */
export function transformData(
  labels: string[],
  dataPoints: any[],
  options: {
    keepOriginalTimestamp?: boolean
    timestampMultiplier?: number
  } = {},
): any[] {
  const {
    keepOriginalTimestamp = false,
    timestampMultiplier = 1000, // Default to milliseconds
  } = options

  const result: any[] = []

  for (const point of dataPoints) {
    const timestamp = point[0] // First element is always timestamp
    const timeStr = formatTimestamp(timestamp, timestampMultiplier)

    const transformedPoint: Record<string, string | number> = {
      timestamp: timeStr,
      ...(keepOriginalTimestamp ? { originalTimestamp: timestamp } : {}),
    }

    // Simply map all values starting from index 1
    for (let i = 1; i < labels.length; i++) {
      // Use labels[i] as key, convert to lowercase for consistency
      transformedPoint[labels[i].toLowerCase()] = point[i]
    }

    result.push(transformedPoint)
  }

  return result
}

/**
 * Formats a timestamp to a time string
 * @param timestamp Timestamp to format
 * @param multiplier Multiplier for timestamp (e.g., 1000 for milliseconds)
 * @returns Formatted time string in HH:MM:SS format
 */
export function formatTimestamp(
  timestamp: number,
  multiplier: number = 1000,
): string {
  try {
    const date = new Date(timestamp * multiplier)
    return date.toTimeString().substring(0, 8) // HH:MM:SS format
  } catch (error) {
    console.warn('Invalid timestamp:', timestamp)
    return 'Invalid Time'
  }
}

/**
 * Fetches and transforms time-series data from Netdata.
 *
 * @template T - The type of system metrics being retrieved.
 * @param {NetdataApiParams} params - API connection parameters.
 * @param {NetdataContexts} [context] - The context to query (optional if `chart` is provided).
 * @param {string} [chart] - The specific chart to query (optional if `context` is provided).
 * @param {number} [minutes=30] - Number of minutes of data to retrieve (defaults to 30).
 * @param {boolean} [format=true] - If true, returns formatted data; otherwise, returns raw data.
 * @returns {Promise<MetricsResponse<{ labels: string[]; data: T[] }>>} - A promise that resolves to the processed time-series data sorted in ascending order by time.
 */
export const getTimeSeriesData = async <T extends SystemMetrics>(
  params: NetdataApiParams,
  context?: NetdataContexts | string,
  chart?: string,
  minutes: number = 30,
  format: boolean = true,
): Promise<MetricsResponse<{ labels: string[]; data: T[] }>> => {
  if (!context && !chart) {
    return {
      success: false,
      message: 'Either context or chart must be provided.',
    }
  }

  // Calculate seconds for the 'after' parameter
  const secondsAgo = minutes * 60

  // Build query with 'after' parameter to get data from the last X minutes
  const query = `data?${context ? `context=${context}&` : ''}${chart ? `chart=${chart}&` : ''}after=-${secondsAgo}&before=0&format=json&options=seconds`

  // Fetch data
  const data = await netdataAPI(params, query)

  // Check if we have data and labels
  if (
    !data ||
    !data.data ||
    data.data.length === 0 ||
    !data.labels ||
    data.labels.length === 0
  ) {
    return {
      success: false,
      message: `No data available for ${context || chart}`,
    }
  }

  if (!format) {
    return {
      success: true,
      message: `${context || chart} raw data retrieved successfully`,
      data: data as { labels: string[]; data: T[] }, // Returning both labels and data
    }
  }

  // Get labels and data points
  const labels = data.labels
  const points = data.data

  // Transform the data
  let transformedData = transformData(labels, points) as T[]

  const convertTimeToTimestamp = (timeStr: string) => {
    const [hours, minutes, seconds, milliseconds] = timeStr
      .split(':')
      .map(Number)
    const now = new Date()
    now.setHours(hours || 0, minutes || 0, seconds || 0, milliseconds || 0)

    return now.getTime() // Returns timestamp in milliseconds
  }

  // Sort data by time
  transformedData = transformedData.sort((a: T, b: T) => {
    const timeA = convertTimeToTimestamp(a.timestamp || '00:00:00')
    const timeB = convertTimeToTimestamp(b.timestamp || '00:00:00')
    return timeA - timeB
  })

  return {
    success: true,
    message: `${context || chart} time series data retrieved successfully`,
    data: {
      labels, // Returning labels
      data: transformedData, // Returning transformed data
    },
  }
}
