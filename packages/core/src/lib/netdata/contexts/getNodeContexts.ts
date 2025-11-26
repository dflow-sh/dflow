import { netdataAPI } from "@core/lib/netdata/netdataAPI"
import { NetdataApiParams } from "@core/lib/netdata/types"

/**
 * Get a list of all node contexts (v1)
 * @param params API parameters
 * @returns List of all node contexts
 */
export const getNodeContexts = async (
  params: NetdataApiParams,
): Promise<any> => {
  return netdataAPI(params, 'contexts')
}
