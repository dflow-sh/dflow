import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

import { NodeInfoResponse } from './types'

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
