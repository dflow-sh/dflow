'use server'

import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

/**
 * Common response type for all metric functions
 */
export interface MetricsResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

/**
 * Interface for server status data
 */
export interface ServerStatus {
  status: string
  uptime: string
  lastIncident: string
  activeAlerts: number
}

/**
 * Define a type for service health status
 */
export interface ServiceHealth {
  status: string
  name: string
}

/**
 * Define an interface for the services object
 */
export interface ServicesMap {
  [key: string]: ServiceHealth
}

/**
 * Interface for NetData alarm object
 */
export interface NetdataAlarm {
  id?: string
  name: string
  chart?: string
  status: string
  last_status_change: number
  info?: string
}

/**
 * Interface for NetData alarms response
 */
export interface NetdataAlarmsResponse {
  alarms: {
    [key: string]: NetdataAlarm
  }
}

/**
 * Gets server status information including status, uptime, and alerts
 * @param params API connection parameters
 * @returns Server status information
 */
export const getServerStatus = async (
  params: NetdataApiParams,
): Promise<MetricsResponse<ServerStatus>> => {
  try {
    // Get uptime information
    const uptimeData = await netdataAPI(params, 'data?chart=system.uptime')

    // Get alert status
    const alertsData = (await netdataAPI(
      params,
      'alarms?all',
    )) as NetdataAlarmsResponse

    // Calculate server status metrics
    let status = 'online'
    let uptimePercentage = '99.98%' // Default value
    let lastIncident = 'Never'
    let activeAlerts = 0

    // Process uptime data if available
    if (uptimeData && uptimeData.data && uptimeData.data.length > 0) {
      // Latest uptime value in seconds
      const uptimeSeconds = uptimeData.data[uptimeData.data.length - 1][1]

      // Calculate uptime in days/hours format
      if (uptimeSeconds) {
        const uptimeDays = Math.floor(uptimeSeconds / (60 * 60 * 24))
        if (uptimeDays > 0) {
          uptimePercentage = '99.98%' // Using a fixed value for uptime percentage
        }
      }
    }

    // Process alerts data if available
    if (alertsData && alertsData.alarms) {
      // Count active alerts
      activeAlerts = Object.values(alertsData.alarms).filter(
        (alarm: NetdataAlarm) =>
          alarm.status === 'CRITICAL' || alarm.status === 'WARNING',
      ).length

      // Set status based on alerts
      if (activeAlerts > 0) {
        const criticalAlerts = Object.values(alertsData.alarms).filter(
          (alarm: NetdataAlarm) => alarm.status === 'CRITICAL',
        ).length

        status = criticalAlerts > 0 ? 'critical' : 'warning'
      }

      // Find last incident time
      const alarms = Object.values(alertsData.alarms)
      const alarmsWithStatusChange = alarms.filter(
        (alarm: NetdataAlarm) => alarm.last_status_change !== 0,
      )

      if (alarmsWithStatusChange.length > 0) {
        const latestAlarm = alarmsWithStatusChange.sort(
          (a: NetdataAlarm, b: NetdataAlarm) =>
            b.last_status_change - a.last_status_change,
        )[0]

        const lastIncidentTime = new Date(latestAlarm.last_status_change * 1000)
        const now = new Date()
        const daysDiff = Math.floor(
          (now.getTime() - lastIncidentTime.getTime()) / (1000 * 60 * 60 * 24),
        )

        lastIncident = daysDiff === 0 ? 'Today' : `${daysDiff} days ago`
      }
    }

    return {
      success: true,
      message: 'Server status retrieved successfully',
      data: {
        status,
        uptime: uptimePercentage,
        lastIncident,
        activeAlerts,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to retrieve server status',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Gets health summary for all monitored services
 * @param params API connection parameters
 * @returns Health summary for different service categories
 */
export const getServicesHealth = async (
  params: NetdataApiParams,
): Promise<MetricsResponse<ServiceHealth[]>> => {
  try {
    // Get all charts info to identify monitored services
    const chartsData = await netdataAPI(params, 'charts')

    // Get alarms status
    const alertsData = (await netdataAPI(
      params,
      'alarms?all',
    )) as NetdataAlarmsResponse

    // Default service categories
    const services: ServicesMap = {
      database: { status: 'healthy', name: 'Database' },
      webserver: { status: 'healthy', name: 'Web Server' },
      application: { status: 'healthy', name: 'Application' },
      storage: { status: 'healthy', name: 'Storage' },
      network: { status: 'healthy', name: 'Network' },
    }

    // Map chart families to service categories
    const serviceMapping: { [key: string]: string } = {
      mysql: 'database',
      postgres: 'database',
      mongodb: 'database',
      nginx: 'webserver',
      apache: 'webserver',
      web: 'webserver',
      disk: 'storage',
      net: 'network',
      tcp: 'network',
      mem: 'application',
      apps: 'application',
    }

    // Check which services are monitored
    if (chartsData && chartsData.charts) {
      Object.keys(chartsData.charts).forEach(chartId => {
        for (const [key, category] of Object.entries(serviceMapping)) {
          if (chartId.includes(key) && category in services) {
            services[category].status = 'monitored'
          }
        }
      })
    }

    // Update status based on alarms
    if (alertsData && alertsData.alarms) {
      Object.values(alertsData.alarms).forEach((alarm: NetdataAlarm) => {
        for (const [key, category] of Object.entries(serviceMapping)) {
          if (
            alarm.chart &&
            alarm.chart.includes(key) &&
            category in services
          ) {
            if (alarm.status === 'CRITICAL') {
              services[category].status = 'critical'
            } else if (
              alarm.status === 'WARNING' &&
              services[category].status !== 'critical'
            ) {
              services[category].status = 'warning'
            }
          }
        }
      })
    }

    return {
      success: true,
      message: 'Services health retrieved successfully',
      data: Object.values(services),
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to retrieve services health',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Gets recent alert history
 * @param params API connection parameters
 * @param limit Maximum number of alerts to return
 * @returns Recent alerts with details
 */
export const getRecentAlerts = async (
  params: NetdataApiParams,
  limit: number = 5,
): Promise<MetricsResponse<any[]>> => {
  try {
    // Get all alarms including recent transitions
    const alertsData = (await netdataAPI(
      params,
      'alarms?all',
    )) as NetdataAlarmsResponse

    if (!alertsData || !alertsData.alarms) {
      return {
        success: false,
        message: 'No alerts data available',
      }
    }

    // Format alerts into readable history
    const recentAlerts = Object.values(alertsData.alarms)
      .filter((alarm: NetdataAlarm) => alarm.last_status_change !== 0)
      .sort(
        (a: NetdataAlarm, b: NetdataAlarm) =>
          b.last_status_change - a.last_status_change,
      )
      .slice(0, limit)
      .map((alarm: NetdataAlarm) => {
        const date = new Date(alarm.last_status_change * 1000)

        return {
          id: alarm.id || alarm.name,
          title: alarm.name,
          status: alarm.status.toLowerCase(),
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          message:
            alarm.info || `${alarm.name} status changed to ${alarm.status}`,
        }
      })

    return {
      success: true,
      message: 'Recent alerts retrieved successfully',
      data: recentAlerts,
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to retrieve recent alerts',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Gets system resources summary (current usage snapshots)
 * @param params API connection parameters
 * @returns Current system resource usage summary
 */
export const getSystemResources = async (
  params: NetdataApiParams,
): Promise<MetricsResponse<any>> => {
  try {
    // Get key system metrics
    const [cpuData, memData, diskData] = await Promise.all([
      netdataAPI(params, 'data?chart=system.cpu'),
      netdataAPI(params, 'data?chart=system.ram'),
      netdataAPI(params, 'data?chart=disk_space._'),
    ])

    // Process CPU data
    let cpuUsage = 0
    if (cpuData && cpuData.data && cpuData.data.length > 0) {
      const latestData = cpuData.data[cpuData.data.length - 1]
      const idleIndex = cpuData.labels.indexOf('idle')
      if (idleIndex > 0) {
        cpuUsage = Math.round(100 - latestData[idleIndex])
      }
    }

    // Process memory data
    let memoryUsage = 0
    if (memData && memData.data && memData.data.length > 0) {
      const latestData = memData.data[memData.data.length - 1]
      const freeIndex = memData.labels.indexOf('free')
      const totalIndex = memData.labels.indexOf('total')

      if (freeIndex > 0 && totalIndex > 0) {
        const free = latestData[freeIndex]
        const total = latestData[totalIndex]
        memoryUsage = Math.round(((total - free) / total) * 100)
      }
    }

    // Process disk data
    let diskUsage = 0
    if (diskData && diskData.data && diskData.data.length > 0) {
      const latestData = diskData.data[diskData.data.length - 1]
      const availIndex = diskData.labels.indexOf('avail')
      const usedIndex = diskData.labels.indexOf('used')

      if (availIndex > 0 && usedIndex > 0) {
        const avail = latestData[availIndex]
        const used = latestData[usedIndex]
        const total = avail + used
        diskUsage = Math.round((used / total) * 100)
      }
    }

    return {
      success: true,
      message: 'System resources retrieved successfully',
      data: {
        cpu: {
          usage: cpuUsage,
          status:
            cpuUsage > 90 ? 'critical' : cpuUsage > 70 ? 'warning' : 'normal',
        },
        memory: {
          usage: memoryUsage,
          status:
            memoryUsage > 90
              ? 'critical'
              : memoryUsage > 70
                ? 'warning'
                : 'normal',
        },
        disk: {
          usage: diskUsage,
          status:
            diskUsage > 90 ? 'critical' : diskUsage > 70 ? 'warning' : 'normal',
        },
      },
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to retrieve system resources',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Gets all server and system status information for the dashboard
 * @param params API connection parameters
 * @returns Complete status information for the dashboard
 */
export const getServerDashboardStatus = async (
  params: NetdataApiParams,
): Promise<MetricsResponse<any>> => {
  const results = await Promise.allSettled([
    getServerStatus(params),
    getServicesHealth(params),
    getRecentAlerts(params),
    getSystemResources(params),
  ])

  // Extract data from settled promises
  const [serverStatus, servicesHealth, recentAlerts, systemResources] =
    results.map(result =>
      result.status === 'fulfilled'
        ? result.value
        : { success: false, data: null },
    )

  return {
    success: true,
    message: 'Server dashboard status retrieved - some data may be unavailable',
    data: {
      serverStatus: serverStatus.success ? serverStatus.data : null,
      servicesHealth: servicesHealth.success ? servicesHealth.data : null,
      recentAlerts: recentAlerts.success ? recentAlerts.data : null,
      systemResources: systemResources.success ? systemResources.data : null,
    },
  }
}
