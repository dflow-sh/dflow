import { NetdataApiParams } from '../types'
import { netdataAPI } from '../utils'

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
