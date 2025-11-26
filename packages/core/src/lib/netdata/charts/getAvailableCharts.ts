import { netdataAPI } from "@core/lib/netdata/netdataAPI"
import { NetdataApiParams } from "@core/lib/netdata/types"

/**
 * Get available charts from Netdata (v1) - DEPRECATED
 * @param params API parameters
 * @returns List of available charts
 * @deprecated Use contexts instead in new code
 */
export const getAvailableCharts = async (
  params: NetdataApiParams,
): Promise<any> => {
  return netdataAPI(params, 'charts')
}
