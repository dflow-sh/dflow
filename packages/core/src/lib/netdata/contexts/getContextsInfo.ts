import { netdataAPI } from "@core/lib/netdata/netdataAPI"
import { NetdataApiParams } from "@core/lib/netdata/types"

/**
 * Get information about all contexts (v2)
 * @param params API parameters
 * @returns Information about all contexts
 */
export const getContextsInfo = async (
  params: NetdataApiParams,
): Promise<any> => {
  return netdataAPI(params, 'contexts', 'v2')
}
