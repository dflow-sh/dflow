import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

/**
 * Analyze metrics correlations (v1) - EOL
 * @param params API parameters
 * @param options Additional options
 * @returns Correlation results
 * @deprecated This endpoint is marked as End of Life in the Netdata documentation
 */
export const getMetricCorrelations = async (
  params: NetdataApiParams,
  options: Record<string, string | number | boolean> = {},
): Promise<any> => {
  const queryParams = new URLSearchParams()

  Object.entries(options).forEach(([key, value]) => {
    queryParams.append(key, String(value))
  })

  return netdataAPI(params, `metric_correlations?${queryParams.toString()}`)
}
