import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

/**
 * Query data for a single node or chart (v1)
 * @param params API parameters
 * @param chart Chart name
 * @param additionalParams Additional query parameters
 * @returns Query results
 */
export const queryData = async (
  params: NetdataApiParams,
  chart: string,
  additionalParams: Record<string, string | number | boolean> = {},
): Promise<any> => {
  const queryParams = new URLSearchParams()
  queryParams.append('chart', chart)

  Object.entries(additionalParams).forEach(([key, value]) => {
    queryParams.append(key, String(value))
  })

  return netdataAPI(params, `data?${queryParams.toString()}`)
}
