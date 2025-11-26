import { netdataAPI } from "@core/lib/netdata/netdataAPI"
import { NetdataApiParams } from "@core/lib/netdata/types"

/**
 * Get information about all monitored nodes (v2)
 * @param params API parameters
 * @returns Information about all monitored nodes
 */
export const getNodesInfo = async (params: NetdataApiParams): Promise<any> => {
  return netdataAPI(params, 'nodes', 'v2')
}
