import { netdataAPI } from '../netdataAPI'
import { NetdataApiParams } from '../types'

export interface MetricsResponse<T> {
  success: boolean
  message: string
  data?: {
    overview: T
    detailed?: any
  }
  error?: string
}

export interface ServerStatusOverview {
  status: 'online' | 'warning' | 'critical' | 'offline'
  uptimePercentage: string
  activeAlerts: number
  lastIncident: string
}

export interface ServerStatusDetailed {
  uptimeSeconds: number
  bootTime: string
  alertHistory: NetdataAlarm[]
}

export interface ServiceHealth {
  name: string
  status: 'healthy' | 'monitored' | 'warning' | 'critical' | 'unknown'
  lastChecked: string
}

export interface NetdataAlarm {
  id?: string
  name: string
  chart?: string
  status: 'CRITICAL' | 'WARNING' | 'CLEAR' | 'UNDEFINED'
  last_status_change: number
  info?: string
  value?: number
}

export interface NetdataAlarmsResponse {
  alarms: {
    [key: string]: NetdataAlarm
  }
}

export const getServerStatus = async (
  params: NetdataApiParams,
): Promise<MetricsResponse<ServerStatusOverview>> => {
  try {
    const [uptimeData, alertsData] = await Promise.all([
      netdataAPI(params, 'data?chart=system.uptime'),
      netdataAPI(params, 'alarms?all') as Promise<NetdataAlarmsResponse>,
    ])

    let status: ServerStatusOverview['status'] = 'online'
    let uptimePercentage = '99.98%'
    let activeAlerts = 0
    let lastIncident = 'Never'
    let detailed: ServerStatusDetailed = {
      uptimeSeconds: 0,
      bootTime: 'Unknown',
      alertHistory: [],
    }

    // Process uptime
    if (uptimeData?.data?.length) {
      const latest = uptimeData.data[uptimeData.data.length - 1]
      const uptimeSeconds = latest[1]
      detailed.uptimeSeconds = uptimeSeconds

      const bootTimestamp = Math.floor(Date.now() / 1000) - uptimeSeconds
      detailed.bootTime = new Date(bootTimestamp * 1000).toLocaleString()

      const days = Math.floor(uptimeSeconds / (60 * 60 * 24))
      uptimePercentage = days > 365 ? '99.99%' : days > 30 ? '99.98%' : '99.95%'
    }

    // Process alerts
    if (alertsData?.alarms) {
      const alarms = Object.values(alertsData.alarms)
      activeAlerts = alarms.filter(
        a => a.status === 'CRITICAL' || a.status === 'WARNING',
      ).length

      status =
        activeAlerts > 0
          ? alarms.some(a => a.status === 'CRITICAL')
            ? 'critical'
            : 'warning'
          : 'online'

      const sortedAlarms = alarms
        .filter(a => a.last_status_change > 0)
        .sort((a, b) => b.last_status_change - a.last_status_change)

      if (sortedAlarms.length) {
        const latest = sortedAlarms[0]
        const timeDiff =
          (Date.now() / 1000 - latest.last_status_change) / (60 * 60 * 24)
        lastIncident =
          timeDiff < 1 ? 'Today' : `${Math.floor(timeDiff)} days ago`
        detailed.alertHistory = sortedAlarms.slice(0, 5)
      }
    }

    return {
      success: true,
      message: 'Server status retrieved successfully',
      data: {
        overview: { status, uptimePercentage, activeAlerts, lastIncident },
        detailed,
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

export const getServicesHealth = async (
  params: NetdataApiParams,
): Promise<MetricsResponse<ServiceHealth[]>> => {
  try {
    const [chartsData, alertsData] = await Promise.all([
      netdataAPI(params, 'charts'),
      netdataAPI(params, 'alarms?all') as Promise<NetdataAlarmsResponse>,
    ])

    const services: { [key: string]: ServiceHealth } = {
      database: {
        name: 'Database',
        status: 'healthy',
        lastChecked: new Date().toISOString(),
      },
      webserver: {
        name: 'Web Server',
        status: 'healthy',
        lastChecked: new Date().toISOString(),
      },
      application: {
        name: 'Application',
        status: 'healthy',
        lastChecked: new Date().toISOString(),
      },
      storage: {
        name: 'Storage',
        status: 'healthy',
        lastChecked: new Date().toISOString(),
      },
      network: {
        name: 'Network',
        status: 'healthy',
        lastChecked: new Date().toISOString(),
      },
    }

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

    // Update monitored status
    if (chartsData?.charts) {
      Object.keys(chartsData.charts).forEach(chartId => {
        for (const [key, category] of Object.entries(serviceMapping)) {
          if (chartId.includes(key) && services[category]) {
            services[category].status = 'monitored'
          }
        }
      })
    }

    // Update alert status
    if (alertsData?.alarms) {
      Object.values(alertsData.alarms).forEach(alarm => {
        for (const [key, category] of Object.entries(serviceMapping)) {
          if (alarm.chart?.includes(key) && services[category]) {
            services[category].status =
              alarm.status === 'CRITICAL'
                ? 'critical'
                : alarm.status === 'WARNING'
                  ? 'warning'
                  : services[category].status
          }
        }
      })
    }

    return {
      success: true,
      message: 'Services health retrieved successfully',
      data: { overview: Object.values(services) },
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to retrieve services health',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export const getRecentAlerts = async (
  params: NetdataApiParams,
  limit: number = 5,
): Promise<MetricsResponse<any[]>> => {
  try {
    const alertsData = (await netdataAPI(
      params,
      'alarms?all',
    )) as NetdataAlarmsResponse

    if (!alertsData?.alarms) {
      return { success: false, message: 'No alerts data available' }
    }

    const recentAlerts = Object.values(alertsData.alarms)
      .filter(a => a.last_status_change > 0)
      .sort((a, b) => b.last_status_change - a.last_status_change)
      .slice(0, limit)
      .map(alarm => {
        const date = new Date(alarm.last_status_change * 1000)
        return {
          id: alarm.id || alarm.name,
          title: alarm.name,
          status: alarm.status.toLowerCase(),
          timestamp: alarm.last_status_change,
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          message: alarm.info || `${alarm.name} changed to ${alarm.status}`,
          chart: alarm.chart,
        }
      })

    return {
      success: true,
      message: 'Recent alerts retrieved successfully',
      data: { overview: recentAlerts },
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to retrieve recent alerts',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export const getSystemResources = async (
  params: NetdataApiParams,
): Promise<MetricsResponse<any>> => {
  try {
    const [cpuData, memData, diskData, netData, loadData] = await Promise.all([
      netdataAPI(params, 'data?chart=system.cpu'),
      netdataAPI(params, 'data?chart=system.ram'),
      netdataAPI(params, 'data?chart=disk_space._'),
      netdataAPI(params, 'data?chart=system.net'),
      netdataAPI(params, 'data?chart=system.load'),
    ])

    const getStatus = (usage: number) =>
      usage > 90 ? 'critical' : usage > 70 ? 'warning' : 'normal'

    // CPU
    let cpuUsage = 0
    if (cpuData?.data?.length) {
      const latest = cpuData.data[cpuData.data.length - 1]
      const idleIndex = cpuData.labels.indexOf('idle')
      cpuUsage = idleIndex > 0 ? Math.round(100 - latest[idleIndex]) : 0
    }

    // Memory
    let memoryUsage = 0
    let memoryDetailed = {}
    if (memData?.data?.length) {
      const latest = memData.data[memData.data.length - 1]
      const labels = memData.labels
      const total = labels.reduce(
        (sum: number, label: string, i: number) =>
          label !== 'time' ? sum + (latest[i] || 0) : sum,
        0,
      )
      memoryUsage = total
        ? Math.round((latest[labels.indexOf('used')] / total) * 100)
        : 0
      memoryDetailed = labels.reduce(
        (obj: any, label: string, i: number) => ({
          ...obj,
          [label]: latest[i],
        }),
        {},
      )
    }

    // Disk
    let diskUsage = 0
    if (diskData?.data?.length) {
      const latest = diskData.data[diskData.data.length - 1]
      const used = latest[diskData.labels.indexOf('used')]
      const avail = latest[diskData.labels.indexOf('avail')]
      const total = used + avail
      diskUsage = total ? Math.round((used / total) * 100) : 0
    }

    // Network
    let networkTraffic = { in: 0, out: 0 }
    if (netData?.data?.length) {
      const latest = netData.data[netData.data.length - 1]
      networkTraffic = {
        in: Math.abs(latest[netData.labels.indexOf('received')] / 1024), // KB/s
        out: Math.abs(latest[netData.labels.indexOf('sent')] / 1024), // KB/s
      }
    }

    // Load
    let load = 0
    if (loadData?.data?.length) {
      load =
        loadData.data[loadData.data.length - 1][
          loadData.labels.indexOf('load1')
        ]
    }

    return {
      success: true,
      message: 'System resources retrieved successfully',
      data: {
        overview: {
          cpu: { usage: cpuUsage, status: getStatus(cpuUsage) },
          memory: { usage: memoryUsage, status: getStatus(memoryUsage) },
          disk: { usage: diskUsage, status: getStatus(diskUsage) },
          network: { in: networkTraffic.in, out: networkTraffic.out },
          load: { value: parseFloat(load.toFixed(2)) },
        },
        detailed: { memoryBreakdown: memoryDetailed },
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

export const getServerDashboardStatus = async (
  params: NetdataApiParams,
): Promise<MetricsResponse<any>> => {
  const results = await Promise.allSettled([
    getServerStatus(params),
    getServicesHealth(params),
    getRecentAlerts(params),
    getSystemResources(params),
  ])

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
      overview: {
        serverStatus: serverStatus.data?.overview || null,
        servicesHealth: servicesHealth.data?.overview || null,
        recentAlerts: recentAlerts.data?.overview || null,
        systemResources: systemResources.data?.overview || null,
      },
      detailed: {
        serverStatus: serverStatus.data?.detailed || null,
        systemResources: systemResources.data?.detailed || null,
      },
    },
  }
}
