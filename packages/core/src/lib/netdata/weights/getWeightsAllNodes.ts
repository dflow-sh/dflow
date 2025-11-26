import { netdataAPI } from "@core/lib/netdata/netdataAPI"
import { NetdataApiParams } from "@core/lib/netdata/types"

/**
 * Score or weight metrics across all nodes (v2)
 * @param params API parameters
 * @param algorithm Scoring algorithm
 * @param options Additional options
 * @returns Scoring results
 */
export const getWeightsAllNodes = async (
  params: NetdataApiParams,
  algorithm: string,
  options: Record<string, string | number | boolean> = {},
): Promise<any> => {
  const queryParams = new URLSearchParams()
  queryParams.append('algorithm', algorithm)

  Object.entries(options).forEach(([key, value]) => {
    queryParams.append(key, String(value))
  })

  return netdataAPI(params, `weights?${queryParams.toString()}`, 'v2')
}
