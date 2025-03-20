import { NetdataApiParams } from '../types'
import { netdataAPI } from '../utils'

/**
 * Get a list of all registered collector functions
 * @param params API parameters
 * @returns List of functions
 */
export const getAllFunctions = async (
  params: NetdataApiParams,
): Promise<any> => {
  return netdataAPI(params, 'functions')
}
