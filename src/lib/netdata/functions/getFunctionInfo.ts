import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

/**
 * Get information about a specific function
 * @param params API parameters
 * @param functionName Name of the function
 * @returns Function information
 */
export const getFunctionInfo = async (
  params: NetdataApiParams,
  functionName: string,
): Promise<any> => {
  const queryParams = new URLSearchParams()
  queryParams.append('function', functionName)

  return netdataAPI(params, `function?${queryParams.toString()}`)
}
