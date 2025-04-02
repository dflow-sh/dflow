import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

/**
 * Get a list of alarm values
 * @param params API parameters
 * @returns Alarm values
 */
export const getAlarmsValues = async (
  params: NetdataApiParams,
): Promise<any> => {
  return netdataAPI(params, 'alarms_values')
}
