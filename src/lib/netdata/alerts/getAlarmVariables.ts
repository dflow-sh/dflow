import { NetdataApiParams } from '../types'
import { netdataAPI } from '../utils'

/**
 * List variables available to configure alarms for a chart
 * @param params API parameters
 * @param chart Chart name
 * @returns Alarm variables
 */
export const getAlarmVariables = async (
  params: NetdataApiParams,
  chart: string,
): Promise<any> => {
  const queryParams = new URLSearchParams()
  queryParams.append('chart', chart)
  return netdataAPI(params, `alarm_variables?${queryParams.toString()}`)
}
