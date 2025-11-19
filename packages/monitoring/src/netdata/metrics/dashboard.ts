import { MetricsResponse, NetdataApiParams } from '../types'

import * as cpuMetrics from './cpuMetrics'
import * as diskMetrics from './diskMetrics'
import * as memoryMetrics from './memoryMetrics'
import * as networkMetrics from './networkMetrics'
import * as systemMetrics from './systemMetrics'

export const getDashboardMetrics = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const results = await Promise.allSettled([
    cpuMetrics.getCpuUtilization(params, points),
    cpuMetrics.getCpuSomePressure(params, points),
    cpuMetrics.getCpuSomePressureStallTime(params, points),
    diskMetrics.getDiskSpaceUsage(params, points),
    diskMetrics.getDiskIO(params, points),
    diskMetrics.getSystemIO(params, points),
    memoryMetrics.getMemoryUsage(params, points),
    memoryMetrics.getMemoryAvailable(params, points),
    memoryMetrics.getMemorySomePressure(params, points),
    memoryMetrics.getMemorySomePressureStallTime(params, points),
    networkMetrics.getNetworkBandwidth(params, points),
    networkMetrics.getNetworkTraffic(params, points),
    networkMetrics.getNetworkPackets(params, points),
    networkMetrics.getNetworkErrors(params, points),
    systemMetrics.getServerLoad(params, points),
    systemMetrics.getServerUptime(params, points),
    systemMetrics.getSystemAlerts(params),
    // webMetrics.getWebRequests(params, points),
    // webMetrics.getResponseTimes(params, points),
  ])

  const [
    cpuUtilization,
    cpuSomePressure,
    cpuSomePressureStallTime,
    diskSpace,
    diskIO,
    systemIO,
    memoryUsage,
    memoryAvailable,
    memorySomePressure,
    memorySomePressureStallTime,
    networkBandwidth,
    networkTraffic,
    networkPackets,
    networkErrors,
    serverLoad,
    serverUptime,
    systemAlerts,
    // webRequests,
    // responseTimes,
  ] = results.map(result =>
    result.status === 'fulfilled'
      ? result.value
      : { success: false, data: null },
  )

  return {
    success: true,
    message: 'Dashboard metrics retrieved - some data may be unavailable',
    data: {
      overview: {
        cpuUtilization: cpuUtilization.data?.overview,
        cpuSomePressure: cpuSomePressure.data?.overview,
        cpuSomePressureStallTime: cpuSomePressureStallTime.data?.overview,
        diskSpace: diskSpace.data?.overview,
        diskIO: diskIO.data?.overview,
        systemIO: systemIO.data?.overview,
        memoryUsage: memoryUsage.data?.overview,
        memoryAvailable: memoryAvailable.data?.overview,
        memorySomePressure: memorySomePressure.data?.overview,
        memorySomePressureStallTime: memorySomePressureStallTime.data?.overview,
        networkBandwidth: networkBandwidth.data?.overview,
        networkTraffic: networkTraffic.data?.overview,
        networkPackets: networkPackets.data?.overview,
        networkErrors: networkErrors.data?.overview,
        serverLoad: serverLoad.data?.overview,
        serverUptime: serverUptime.data?.overview,
        systemAlerts: systemAlerts.data?.overview,
        // webRequests: webRequests.data?.overview,
        // responseTimes: responseTimes.data?.overview,
      },
      detailed: {
        cpuUtilization: cpuUtilization.data?.detailed,
        cpuSomePressure: cpuSomePressure.data?.detailed,
        cpuSomePressureStallTime: cpuSomePressureStallTime.data?.detailed,
        diskSpace: diskSpace.data?.detailed,
        diskIO: diskIO.data?.detailed,
        systemIO: systemIO.data?.detailed,
        memoryUsage: memoryUsage.data?.detailed,
        memoryAvailable: memoryAvailable.data?.detailed,
        memorySomePressure: memorySomePressure.data?.detailed,
        memorySomePressureStallTime: memorySomePressureStallTime.data?.detailed,
        networkBandwidth: networkBandwidth.data?.detailed,
        networkTraffic: networkTraffic.data?.detailed,
        networkPackets: networkPackets.data?.detailed,
        networkErrors: networkErrors.data?.detailed,
        serverLoad: serverLoad.data?.detailed,
        serverUptime: serverUptime.data?.overview,
        systemAlerts: systemAlerts.data?.detailed,
        // webRequests: webRequests.data?.detailed,
        // responseTimes: responseTimes.data?.detailed,
      },
    },
  }
}
