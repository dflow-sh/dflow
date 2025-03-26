'use server'

import axios from 'axios'

import { transformData } from './transformData'
import { MetricsResponse, NetdataApiParams } from './types'

/**
 * Makes a direct API call to the Netdata API
 * @param params API parameters
 * @param endpoint API endpoint (e.g., 'data?chart=system.cpu')
 * @param version API version (v1 or v2)
 * @returns Response data or error
 */
export const netdataAPI = async (
  params: NetdataApiParams,
  endpoint: string,
  version: 'v1' | 'v2' = 'v1',
): Promise<any> => {
  const {
    host = 'localhost',
    port = 19999,
    after,
    before,
    points,
    group,
    dimensions,
    nodes,
    contexts,
  } = params

  // Build base URL for API
  const baseUrl = `/api/${version}/${endpoint}`

  // Check if endpoint already has query parameters
  const hasQueryParams = baseUrl.includes('?')

  // Create URLSearchParams object for query parameters
  const queryParams = new URLSearchParams()

  // Add query parameters from endpoint if they exist
  if (hasQueryParams) {
    const [path, queryString] = baseUrl.split('?')
    new URLSearchParams(queryString).forEach((value, key) => {
      queryParams.append(key, value)
    })
  }

  // Add common parameters if provided
  if (after !== undefined) queryParams.append('after', after.toString())
  if (before !== undefined) queryParams.append('before', before.toString())
  if (points !== undefined) queryParams.append('points', points.toString())
  if (group !== undefined) queryParams.append('group', group.toString())

  // Additional v2 parameters
  if (version === 'v2') {
    if (dimensions !== undefined)
      queryParams.append('dimensions', dimensions.toString())
    if (nodes !== undefined) queryParams.append('nodes', nodes.toString())
    if (contexts !== undefined)
      queryParams.append('contexts', contexts.toString())
  }

  // Get the query string
  const queryString = queryParams.toString()

  // Complete endpoint with query parameters
  const fullEndpoint = hasQueryParams
    ? baseUrl.split('?')[0] + '?' + queryString
    : baseUrl + (queryString ? '?' + queryString : '')

  try {
    // Use axios to make the request directly
    const apiUrl = `http://${host}:${port}${fullEndpoint}`

    const response = await axios.get(apiUrl)

    return response.data
  } catch (error) {
    console.error('Netdata API call failed:', error)
    throw error
  }
}

/**
 * Checks if Netdata API is accessible
 * @param params API parameters
 * @returns True if API is accessible, false otherwise
 */
export const isApiAccessible = async (
  params: NetdataApiParams,
): Promise<boolean> => {
  try {
    const response = await netdataAPI(params, 'info')

    return !!response?.version
  } catch (error) {
    return false
  }
}

/**
 * Fetches and transforms time-series data from Netdata for the last 20 minutes
 * @param params API connection parameters
 * @param chart Chart name to query
 * @param minutes Number of minutes of data to retrieve (defaults to 20)
 * @returns Processed time-series data sorted in ascending order by time
 */
export const getTimeSeriesData = async <T>(
  params: NetdataApiParams,
  chart: string,
  minutes: number = 30, // Default to 30 minutes
): Promise<MetricsResponse<T[]>> => {
  // Check API accessibility first
  const apiAvailable = await isApiAccessible(params)
  if (!apiAvailable) {
    return {
      success: false,
      message: 'Netdata API is not accessible',
    }
  }

  // Calculate seconds for the 'after' parameter
  const secondsAgo = minutes * 60

  // Build query with 'after' parameter to get data from the last X minutes
  // Adding 'options=seconds' will include timestamps in seconds since epoch
  const query = `data?chart=${chart}&after=-${secondsAgo}&before=0&format=json&options=seconds`

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

  // Transform the data
  let transformedData = transformData(labels, points) as T[]

  const convertTimeToTimestamp = (timeStr: string) => {
    const [hours, minutes, seconds, milliseconds] = timeStr
      .split(':')
      .map(Number)
    const now = new Date()
    now.setHours(hours, minutes, seconds || 0, milliseconds || 0)

    return now.getTime() // Returns timestamp in milliseconds
  }

  // Sort data by time
  transformedData = transformedData.sort((a: any, b: any) => {
    const timeA = convertTimeToTimestamp(a.timestamp || '00:00')
    const timeB = convertTimeToTimestamp(b.timestamp || '00:00')
    return timeA - timeB
  })

  return {
    success: true,
    message: `${chart} time series data retrieved successfully`,
    data: transformedData,
  }
}
