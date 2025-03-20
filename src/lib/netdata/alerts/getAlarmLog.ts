import { NetdataApiParams } from '../types'
import { netdataAPI } from '../utils'

/**
 * Retrieve entries from the alarm log
 * @param params API parameters
 * @returns Alarm log entries
 */
export const getAlarmLog = async (params: NetdataApiParams): Promise<any> => {
  return netdataAPI(params, 'alarm_log')
}
