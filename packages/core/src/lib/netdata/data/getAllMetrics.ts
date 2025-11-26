import { netdataAPI } from "@core/lib/netdata/netdataAPI"
import { NetdataApiParams } from "@core/lib/netdata/types"

/**
 * Get latest values for all metrics (v1)
 * @param params API parameters
 * @param format Response format (json, prometheus, etc.)
 * @returns Latest metric values
 */
export const getAllMetrics = async (
  params: NetdataApiParams,
  format: string = 'json',
): Promise<any> => {
  const queryParams = new URLSearchParams()
  queryParams.append('format', format)
  return netdataAPI(params, `allmetrics?${queryParams.toString()}`)
}
