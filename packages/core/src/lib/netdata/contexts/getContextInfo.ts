import { netdataAPI } from "@core/lib/netdata/netdataAPI"
import { NetdataApiParams } from "@core/lib/netdata/types"

/**
 * Get information about a specific context (v1)
 * @param params API parameters
 * @param contextName Name of the context
 * @returns Context information
 */
export const getContextInfo = async (
  params: NetdataApiParams,
  contextName: string,
): Promise<any> => {
  const queryParams = new URLSearchParams()
  queryParams.append('context', contextName)
  return netdataAPI(params, `context?${queryParams.toString()}`)
}
