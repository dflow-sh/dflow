import { netdataAPI } from "@core/lib/netdata/netdataAPI"
import { NetdataApiParams } from "@core/lib/netdata/types"

/**
 * Get an overall status count of alarms
 * @param params API parameters
 * @returns Alarm count stats
 */
export const getAlarmCount = async (params: NetdataApiParams): Promise<any> => {
  return netdataAPI(params, 'alarm_count')
}
