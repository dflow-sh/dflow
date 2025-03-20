import { NetdataApiParams } from '../types'
import { netdataAPI } from '../utils'

/**
 * Get information about current ACLK state
 * @param params API parameters
 * @returns ACLK state information
 */
export const getAclkInfo = async (params: NetdataApiParams): Promise<any> => {
  return netdataAPI(params, 'aclk')
}
