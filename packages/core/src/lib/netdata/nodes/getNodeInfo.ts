import { netdataAPI } from "@core/lib/netdata/netdataAPI"
import { NetdataApiParams } from "@core/lib/netdata/types"

import { NodeInfoResponse } from "@core/lib/netdata/nodes/types"

/**
 * Get information about the current node (v1)
 * @param params API parameters
 * @returns Current node information
 */
export const getNodeInfo = async (
  params: NetdataApiParams,
): Promise<NodeInfoResponse> => {
  return netdataAPI(params, 'info')
}
