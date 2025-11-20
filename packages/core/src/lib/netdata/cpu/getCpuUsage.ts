import { netdataAPI } from '.././netdataAPI'
import { CpuMetricsResponse, NetdataApiParams } from '.././types'

/**
 * Gets CPU usage metrics from Netdata
 * @param params API parameters
 * @returns CPU metrics including usage percentages
 */
export const getCpuUsage = async (
  params: NetdataApiParams,
): Promise<CpuMetricsResponse> => {
  try {
    // Get CPU data
    const cpuData = await netdataAPI(params, 'data?chart=system.cpu')

    if (!cpuData || !cpuData.data || cpuData.data.length === 0) {
      return {
        success: false,
        message: 'No CPU data available',
      }
    }

    // Get the latest data point
    const latestData = cpuData.result[cpuData.result.length - 1]
    const labels = cpuData.labels || []

    // Process the data
    const processed: any = {
      total: 0,
      user: 0,
      system: 0,
      idle: 100,
    }

    // Calculate totals from the data array
    let idleIndex = -1
    let userIndex = -1
    let systemIndex = -1
    let iowaitIndex = -1
    let irqIndex = -1
    let softirqIndex = -1
    let stealIndex = -1

    // Find indexes for each metric
    for (let i = 0; i < labels.length; i++) {
      if (labels[i] === 'idle') idleIndex = i
      else if (labels[i] === 'user') userIndex = i
      else if (labels[i] === 'system') systemIndex = i
      else if (labels[i] === 'iowait') iowaitIndex = i
      else if (labels[i] === 'irq') irqIndex = i
      else if (labels[i] === 'softirq') softirqIndex = i
      else if (labels[i] === 'steal') stealIndex = i
    }

    // Extract values
    if (idleIndex > 0) processed.idle = latestData[idleIndex]
    if (userIndex > 0) processed.user = latestData[userIndex]
    if (systemIndex > 0) processed.system = latestData[systemIndex]
    if (iowaitIndex > 0) processed.iowait = latestData[iowaitIndex]
    if (irqIndex > 0) processed.irq = latestData[irqIndex]
    if (softirqIndex > 0) processed.softirq = latestData[softirqIndex]
    if (stealIndex > 0) processed.steal = latestData[stealIndex]

    // Calculate total CPU usage (100 - idle)
    processed.total = 100 - processed.idle

    // Get CPU load average
    try {
      const loadData = await netdataAPI(params, 'data?chart=system.load')
      if (loadData && loadData.result && loadData.result.length > 0) {
        const latestLoad = loadData.result[loadData.result.length - 1]
        processed.loadAverage = {
          '1min': latestLoad[1],
          '5min': latestLoad[2],
          '15min': latestLoad[3],
        }
      }
    } catch (error) {
      // Load average is optional, continue without it
      console.log('Could not fetch load average:', error)
    }

    // Try to get per-core metrics
    try {
      const coresData = await netdataAPI(params, 'data?chart=cpu.cpu')
      if (coresData && coresData.result && coresData.result.length > 0) {
        const coreLabels = coresData.labels || []
        const latestCoresData = coresData.result[coresData.result.length - 1]

        processed.cores = {}

        // Skip the first element as it's the timestamp
        for (let i = 1; i < coreLabels.length; i++) {
          const coreName = coreLabels[i]
          // Calculate each core's usage (100 - idle value)
          processed.cores[coreName] = 100 - latestCoresData[i]
        }
      }
    } catch (error) {
      // Per-core metrics are optional
      console.log('Could not fetch per-core metrics:', error)
    }

    return {
      success: true,
      message: 'CPU metrics retrieved successfully',
      data: processed,
    }
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to retrieve CPU metrics',
      error: error.message,
    }
  }
}

// Export all CPU functions
export const cpu = {
  getCpuUsage,
}
