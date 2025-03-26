import { MetricsResponse, NetdataApiParams } from '../types'

import * as cpuMetrics from './cpuMetrics'
import * as diskMetrics from './diskMetrics'
import * as memoryMetrics from './memoryMetrics'
import * as networkMetrics from './networkMetrics'
import * as systemMetrics from './systemMetrics'
import * as webMetrics from './webMetrics'

export const getDashboardMetrics = async (
  params: NetdataApiParams,
  points: number = 24,
): Promise<MetricsResponse<any>> => {
  const results = await Promise.allSettled([
    cpuMetrics.getCpuUtilization(params, points),
    cpuMetrics.getCpuPressure(params, points),
    cpuMetrics.getCpuPressureStallTime(params, points),
    memoryMetrics.getMemoryUsage(params, points),
    memoryMetrics.getSwapUsage(params, points),
    networkMetrics.getNetworkTraffic(params, points),
    networkMetrics.getNetworkPackets(params, points),
    diskMetrics.getDiskSpaceUsage(params),
    diskMetrics.getDiskIO(params, points),
    systemMetrics.getServerLoad(params, points),
    systemMetrics.getSystemAlerts(params),
    webMetrics.getWebRequests(params, points),
    webMetrics.getResponseTimes(params, points),
  ])

  const [
    cpuUtilization,
    cpuPressure,
    cpuPressureStallTime,
    memoryUsage,
    swapUsage,
    networkTraffic,
    networkPackets,
    diskSpace,
    diskIO,
    serverLoad,
    systemAlerts,
    webRequests,
    responseTimes,
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
        cpuPressure: cpuPressure.data?.overview,
        cpuPressureStallTime: cpuPressureStallTime.data?.overview,
        memoryUsage: memoryUsage.data?.overview,
        swapUsage: swapUsage.data?.overview,
        networkTraffic: networkTraffic.data?.overview,
        networkPackets: networkPackets.data?.overview,
        diskSpace: diskSpace.data?.overview,
        diskIO: diskIO.data?.overview,
        serverLoad: serverLoad.data?.overview,
        alerts: systemAlerts.data?.overview,
        webRequests: webRequests.data?.overview,
        responseTimes: responseTimes.data?.overview,
      },
      detailed: {
        cpuUtilization: cpuUtilization.data?.detailed,
        cpuPressure: cpuPressure.data?.detailed,
        cpuPressureStallTime: cpuPressureStallTime.data?.detailed,
        memoryUsage: memoryUsage.data?.detailed,
        swapUsage: swapUsage.data?.detailed,
        networkTraffic: networkTraffic.data?.detailed,
        networkPackets: networkPackets.data?.detailed,
        diskSpace: diskSpace.data?.detailed,
        diskIO: diskIO.data?.detailed,
        serverLoad: serverLoad.data?.detailed,
        alerts: systemAlerts.data?.detailed,
        webRequests: webRequests.data?.detailed,
        responseTimes: responseTimes.data?.detailed,
      },
      latestMetrics: {
        cpuUsageTrend: cpuUtilization.data?.latest,
        cpuPressure: cpuPressure.data?.latest,
        cpuPressureStallTime: cpuPressureStallTime.data?.latest,
      },
    },
  }
}
