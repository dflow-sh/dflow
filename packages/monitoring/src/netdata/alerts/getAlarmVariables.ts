import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

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
