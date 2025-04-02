import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

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
