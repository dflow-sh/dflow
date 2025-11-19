import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

/**
 * Get information about a specific chart (v1) - DEPRECATED
 * @param params API parameters
 * @param chartName Name of the chart
 * @returns Chart information
 * @deprecated Use contexts instead in new code
 */
export const getChartInfo = async (
  params: NetdataApiParams,
  chartName: string,
): Promise<any> => {
  const queryParams = new URLSearchParams()
  queryParams.append('chart', chartName)
  return netdataAPI(params, `chart?${queryParams.toString()}`)
}
