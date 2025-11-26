import { netdataAPI } from "@core/lib/netdata/netdataAPI"
import { NetdataApiParams } from "@core/lib/netdata/types"

/**
 * Access the health management API
 * @param params API parameters
 * @param command Management command
 * @returns Command result
 */
export const manageHealth = async (
  params: NetdataApiParams,
  command: string,
): Promise<any> => {
  const queryParams = new URLSearchParams()
  queryParams.append('cmd', command)
  return netdataAPI(params, `manage/health?${queryParams.toString()}`)
}
