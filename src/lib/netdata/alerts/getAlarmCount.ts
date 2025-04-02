import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

/**
 * Get an overall status count of alarms
 * @param params API parameters
 * @returns Alarm count stats
 */
export const getAlarmCount = async (params: NetdataApiParams): Promise<any> => {
  return netdataAPI(params, 'alarm_count')
}
