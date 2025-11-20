import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

/**
 * Get a list of active or raised alarms on the server
 * @param params API parameters
 * @returns List of alarms
 */
export const getAlarms = async (params: NetdataApiParams): Promise<any> => {
  return netdataAPI(params, 'alarms')
}
