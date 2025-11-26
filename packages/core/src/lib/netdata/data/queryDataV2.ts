import { netdataAPI } from "@core/lib/netdata/netdataAPI"
import { NetdataApiParams } from "@core/lib/netdata/types"

/**
 * Query data with advanced options (v2)
 * @param params API parameters
 * @param queryParams Additional query parameters
 * @returns Query results
 */
export const queryDataV2 = async (
  params: NetdataApiParams,
  queryOptions: Record<string, string | number | boolean>,
): Promise<any> => {
  const queryParams = new URLSearchParams()

  Object.entries(queryOptions).forEach(([key, value]) => {
    queryParams.append(key, String(value))
  })

  return netdataAPI(params, `data?${queryParams.toString()}`, 'v2')
}
