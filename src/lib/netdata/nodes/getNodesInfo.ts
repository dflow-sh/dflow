import { NetdataApiParams } from '../types'
import { netdataAPI } from '../utils'

/**
 * Get information about all monitored nodes (v2)
 * @param params API parameters
 * @returns Information about all monitored nodes
 */
export const getNodesInfo = async (params: NetdataApiParams): Promise<any> => {
  return netdataAPI(params, 'nodes', 'v2')
}
