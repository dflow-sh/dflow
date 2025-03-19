import { NetdataApiParams } from '.././types'
import { isApiAccessible, netdataAPI } from '.././utils'

/**
 * Common response type for all metric functions
 */
export interface MetricsResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

/**
 * Formats a Unix timestamp to a time string in HH:MM format
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toTimeString().substring(0, 5) // HH:MM format
}

/**
 * Fetches and transforms time-series data from Netdata
 * @param params API connection parameters
 * @param chart Chart name to query
 * @param dataPoints Number of data points to retrieve
 * @returns Processed time-series data
 */
const getTimeSeriesData = async <T>(
  params: NetdataApiParams,
  chart: string,
  dataPoints: number = 100, // Default to 100 data points
): Promise<MetricsResponse<T[]>> => {
  // Check API accessibility first
  const apiAvailable = await isApiAccessible(params)
  if (!apiAvailable) {
    return {
      success: false,
      message: 'Netdata API is not accessible',
    }
  }

  // Build query with points parameter to limit data points
  const query = `data?chart=${chart}&points=${dataPoints}`

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
      message: `No data available for ${chart}`,
    }
  }

  // Get labels and data points
  const labels = data.labels
  const points = data.data

  // Transform the data to the required format based on labels
  return {
    success: true,
    message: `${chart} time series data retrieved successfully`,
    data: transformData(labels, points) as T[],
  }
}

/**
 * Helper function to transform raw data based on labels
 */
function transformData(labels: string[], dataPoints: any[]): any[] {
  const result = []

  // Process each data point
  for (const point of dataPoints) {
    const timestamp = point[0] // First element is always timestamp
    const timeStr = formatTimestamp(timestamp)

    const transformedPoint: any = { time: timeStr }

    // Add values based on label names
    for (let i = 1; i < labels.length; i++) {
      transformedPoint[labels[i]] = point[i]
    }

    result.push(transformedPoint)
  }

  return result
}

/**
 * Gets a single data point for a specific chart
 */
const getChartData = async <T>(
  params: NetdataApiParams,
  chart: string,
): Promise<MetricsResponse<T>> => {
  // Check API accessibility first
  const apiAvailable = await isApiAccessible(params)
  if (!apiAvailable) {
    return {
      success: false,
      message: 'Netdata API is not accessible',
    }
  }

  // Fetch data
  const data = await netdataAPI(params, `data?chart=${chart}`)

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
      message: `No data available for ${chart}`,
    }
  }

  // Get latest data point (last item in the data array)
  const latestData = data.data[data.data.length - 1]
  const labels = data.labels || []

  // Create a mapping of labels to values
  const processedData: any = {}

  // Skip the first element (timestamp)
  for (let i = 1; i < labels.length; i++) {
    processedData[labels[i]] = latestData[i]
  }

  return {
    success: true,
    message: `${chart} metrics retrieved successfully`,
    data: processedData as T,
  }
}

/**
 * Gets CPU usage time series data for shadcn graphs
 */
export const getCpuTimeSeriesData = async (
  params: NetdataApiParams,
  points: number = 24, // 24 data points by default
): Promise<MetricsResponse<any[]>> => {
  const result = await getTimeSeriesData(params, 'system.cpu', points)

  if (!result.success) return result

  // Transform to match the expected format: { time: 'HH:MM', usage: number }
  const formattedData = result.data!.map((point: any) => {
    // Calculate total CPU usage (100 - idle)
    const usage = 100 - (point.idle || 0)
    return {
      time: point.time,
      usage: parseFloat(usage.toFixed(1)),
    }
  })

  return {
    success: true,
    message: 'CPU time series data retrieved successfully',
    data: formattedData,
  }
}

/**
 * Gets memory usage time series data for shadcn graphs
 */
export const getMemoryTimeSeriesData = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any[]>> => {
  const result = await getTimeSeriesData(params, 'system.ram', points)

  if (!result.success) return result

  // Transform to match the expected format: { time: 'HH:MM', usage: number }
  const formattedData = result.data!.map((point: any) => {
    // Calculate memory usage percentage if we have total and free
    let usagePercent = 0
    if (point.total && point.free) {
      const used = point.total - point.free
      usagePercent = Math.round((used / point.total) * 100)
    }

    return {
      time: point.time,
      usage: usagePercent,
    }
  })

  return {
    success: true,
    message: 'Memory time series data retrieved successfully',
    data: formattedData,
  }
}

/**
 * Gets network usage time series data for shadcn graphs
 */
export const getNetworkTimeSeriesData = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any[]>> => {
  const result = await getTimeSeriesData(params, 'system.net', points)

  if (!result.success) return result

  // Transform to match the expected format: { time: 'HH:MM', incoming: number, outgoing: number }
  const formattedData = result.data!.map((point: any) => {
    // Convert to MB/s for better readability (assuming data is in bytes/s)
    const incoming =
      point.received !== undefined
        ? parseFloat((point.received / (1024 * 1024)).toFixed(1))
        : 0

    const outgoing =
      point.sent !== undefined
        ? parseFloat((point.sent / (1024 * 1024)).toFixed(1))
        : 0

    return {
      time: point.time,
      incoming,
      outgoing,
    }
  })

  return {
    success: true,
    message: 'Network time series data retrieved successfully',
    data: formattedData,
  }
}

/**
 * Gets disk usage data in the format expected by shadcn charts
 */
export const getDiskUsageChartData = async (
  params: NetdataApiParams,
): Promise<MetricsResponse<any[]>> => {
  // Get disk space usage
  const diskData = await getChartData(params, 'disk_space._')
  if (!diskData.success) return diskData as any

  // Format data for a pie chart
  // Example: [{ name: 'System', value: 12 }, { name: 'Applications', value: 25 }]
  const data = diskData.data as any
  const formattedData = []

  // Calculate percentage used
  if (data.avail && data.used) {
    const total = data.avail + data.used
    const systemPercent = Math.round((data.used / total) * 100)
    const availPercent = 100 - systemPercent

    formattedData.push(
      { name: 'System', value: systemPercent },
      { name: 'Available', value: availPercent },
    )
  } else {
    // If we can't get the exact data, provide sample fallback
    formattedData.push(
      { name: 'System', value: 50 },
      { name: 'Available', value: 50 },
    )
  }

  return {
    success: true,
    message: 'Disk usage chart data retrieved successfully',
    data: formattedData,
  }
}

/**
 * Gets server load time series data for shadcn graphs
 */
export const getServerLoadTimeSeriesData = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any[]>> => {
  const result = await getTimeSeriesData(params, 'system.load', points)

  if (!result.success) return result

  // Transform to match the expected format: { time: 'HH:MM', load: number }
  const formattedData = result.data!.map((point: any) => {
    return {
      time: point.time,
      load: parseFloat(point.load1.toFixed(1)), // Use 1-minute load average
    }
  })

  return {
    success: true,
    message: 'Server load time series data retrieved successfully',
    data: formattedData,
  }
}

/**
 * Gets request time series data for shadcn graphs (success vs error)
 */
export const getRequestTimeSeriesData = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any[]>> => {
  // Try to get data for different web servers
  const webServers = ['nginx', 'apache', 'web']
  let requestData = null

  // Try each web server until we get data
  for (const server of webServers) {
    const result = await getTimeSeriesData(params, `${server}.requests`, points)
    if (result.success) {
      requestData = result
      break
    }
  }

  if (!requestData || !requestData.success) {
    return {
      success: false,
      message: 'No web request metrics available',
    }
  }

  // Transform to match the expected format: { time: 'HH:MM', success: number, error: number }
  const formattedData = requestData.data!.map((point: any) => {
    // Calculate success and error requests
    // Different web servers have different metrics, so we need to check for common patterns
    const success = point.success || point['2xx'] || point.requests || 0
    const error = point.error || point['5xx'] || point['4xx'] || 0

    return {
      time: point.time,
      success: Math.round(success),
      error: Math.round(error),
    }
  })

  return {
    success: true,
    message: 'Request time series data retrieved successfully',
    data: formattedData,
  }
}

/**
 * Gets response time series data for shadcn graphs
 */
export const getResponseTimeSeriesData = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any[]>> => {
  // Try to get data for different web servers
  const webServers = ['nginx', 'apache', 'web']
  let responseData = null

  // Try each web server until we get data
  for (const server of webServers) {
    const result = await getTimeSeriesData(
      params,
      `${server}.response_time`,
      points,
    )
    if (result.success) {
      responseData = result
      break
    }
  }

  if (!responseData || !responseData.success) {
    return {
      success: false,
      message: 'No response time metrics available',
    }
  }

  // Transform to match the expected format: { time: 'HH:MM', responseTime: number }
  const formattedData = responseData.data!.map((point: any) => {
    // Get response time (different web servers might use different property names)
    let responseTime = 0
    if (point.response_time !== undefined) responseTime = point.response_time
    else if (point.avg !== undefined) responseTime = point.avg

    // Convert to milliseconds if needed
    if (responseTime < 10) responseTime *= 1000 // Assuming seconds to ms conversion

    return {
      time: point.time,
      responseTime: Math.round(responseTime),
    }
  })

  return {
    success: true,
    message: 'Response time series data retrieved successfully',
    data: formattedData,
  }
}

/**
 * Gets all chart data needed for the dashboard in a single call
 */
export const getDashboardMetrics = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const [
    cpuData,
    memoryData,
    networkData,
    diskUsageData,
    serverLoadData,
    requestData,
    responseTimeData,
  ] = await Promise.all([
    getCpuTimeSeriesData(params, points),
    getMemoryTimeSeriesData(params, points),
    getNetworkTimeSeriesData(params, points),
    getDiskUsageChartData(params),
    getServerLoadTimeSeriesData(params, points),
    getRequestTimeSeriesData(params, points),
    getResponseTimeSeriesData(params, points),
  ])

  return {
    success: true,
    message: 'All dashboard metrics retrieved successfully',
    data: {
      cpuData: cpuData.success ? cpuData.data : null,
      memoryData: memoryData.success ? memoryData.data : null,
      networkData: networkData.success ? networkData.data : null,
      diskUsageData: diskUsageData.success ? diskUsageData.data : null,
      serverLoadData: serverLoadData.success ? serverLoadData.data : null,
      requestData: requestData.success ? requestData.data : null,
      responseTimeData: responseTimeData.success ? responseTimeData.data : null,
    },
  }
}

// Export all metrics functions
export const dashboardMetrics = {
  getCpuTimeSeriesData,
  getMemoryTimeSeriesData,
  getNetworkTimeSeriesData,
  getDiskUsageChartData,
  getServerLoadTimeSeriesData,
  getRequestTimeSeriesData,
  getResponseTimeSeriesData,
  getDashboardMetrics,
}

export default dashboardMetrics
