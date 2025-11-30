'use server'

import axios from 'axios'

import { NetdataApiParams } from './types'

/**
 * Makes a direct API call to the Netdata API
 * @param params API parameters
 * @param endpoint API endpoint
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
