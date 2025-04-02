import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

/**
 * Get configuration data
 * @param params API parameters
 * @param section Configuration section
 * @returns Configuration data
 */
export const getConfig = async (
  params: NetdataApiParams,
  section?: string,
): Promise<any> => {
  if (!section) {
    return netdataAPI(params, 'config')
  }

  const queryParams = new URLSearchParams()
  queryParams.append('section', section)

  return netdataAPI(params, `config?${queryParams.toString()}`)
}
