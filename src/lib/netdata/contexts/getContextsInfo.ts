import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

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
