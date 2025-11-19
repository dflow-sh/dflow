import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

/**
 * Generate a badge for a chart or dimension (v1)
 * @param params API parameters
 * @param chart Chart name
 * @param options Badge options
 * @returns Badge SVG image data
 */
export const getBadge = async (
  params: NetdataApiParams,
  chart: string,
  options: Record<string, string | number | boolean> = {},
): Promise<any> => {
  const queryParams = new URLSearchParams()
  queryParams.append('chart', chart)

  Object.entries(options).forEach(([key, value]) => {
    queryParams.append(key, String(value))
  })

  return netdataAPI(params, `badge.svg?${queryParams.toString()}`)
}
