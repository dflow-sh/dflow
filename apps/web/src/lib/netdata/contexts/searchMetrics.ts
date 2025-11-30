import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

/**
 * Perform full text search on metrics (v2)
 * @param params API parameters
 * @param query Search query
 * @returns Search results
 */
export const searchMetrics = async (
  params: NetdataApiParams,
  query: string,
): Promise<any> => {
  const queryParams = new URLSearchParams()
  queryParams.append('q', query)
  return netdataAPI(params, `q?${queryParams.toString()}`, 'v2')
}
