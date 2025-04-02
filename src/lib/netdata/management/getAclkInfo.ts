import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

/**
 * Get information about current ACLK state
 * @param params API parameters
 * @returns ACLK state information
 */
export const getAclkInfo = async (params: NetdataApiParams): Promise<any> => {
  return netdataAPI(params, 'aclk')
}
