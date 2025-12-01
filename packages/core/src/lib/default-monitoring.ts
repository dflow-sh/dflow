// lib/default-monitoring.ts
// This is a sample implementation - replace with your actual API calls

interface MonitoringResponse {
  success: boolean
  data: {
    systemInfo: {
      status: 'online' | 'offline' | 'warning' | 'error' | 'loading'
      uptime: string
      version: string
      hostname: string
    }
    resources: {
      cpu: { usage: number; cores: number }
      memory: { used: number; total: number; percentage: number }
      disk: { used: number; total: number; percentage: number }
      network: { bytesIn: number; bytesOut: number }
    }
    services: Array<{
      name: string
      status: 'running' | 'stopped' | 'error'
      description: string
    }>
    alerts: Array<{
      title: string
      description: string
      severity: 'info' | 'warning' | 'error'
      timestamp: string
    }>
  }
}

interface MonitoringParams {
  serverId: string
  host: string
}

class DefaultMonitoringAPI {
  private baseUrl = '/api/monitoring' // Replace with your API base URL

  async getServerMetrics({
    serverId,
    host,
  }: MonitoringParams): Promise<MonitoringResponse> {
    // Return mock data for development/testing
    return this.getMockData()
  }

  // Mock data for development - remove in production
  private getMockData(): MonitoringResponse {
    return {
      success: true,
      data: {
        systemInfo: {
          status: 'online',
          uptime: '15 days, 3 hours',
          version: 'Ubuntu 22.04.3 LTS',
          hostname: 'web-server-01',
        },
        resources: {
          cpu: { usage: 45, cores: 4 },
          memory: { used: 6144, total: 16384, percentage: 37.5 },
          disk: { used: 120, total: 500, percentage: 24 },
          network: { bytesIn: 1048576000, bytesOut: 2097152000 },
        },
        services: [
          {
            name: 'nginx',
            status: 'running',
            description: 'Web server',
          },
          {
            name: 'mysql',
            status: 'running',
            description: 'Database server',
          },
          {
            name: 'redis',
            status: 'running',
            description: 'Cache server',
          },
          {
            name: 'fail2ban',
            status: 'running',
            description: 'Intrusion prevention',
          },
        ],
        alerts: [
          {
            title: 'High CPU Usage',
            description: 'CPU usage has been above 80% for the last 10 minutes',
            severity: 'warning',
            timestamp: '2 minutes ago',
          },
        ],
      },
    }
  }

  async enableDefaultMonitoring(
    serverId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/server/${serverId}/enable`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error enabling default monitoring:', error)
      throw error
    }
  }

  async disableDefaultMonitoring(
    serverId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/server/${serverId}/disable`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error disabling default monitoring:', error)
      throw error
    }
  }

  async updateMonitoringSettings(
    serverId: string,
    settings: {
      alertThresholds?: {
        cpu?: number
        memory?: number
        disk?: number
      }
      refreshInterval?: number
      enableEmailAlerts?: boolean
      alertEmail?: string
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/server/${serverId}/settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating monitoring settings:', error)
      throw error
    }
  }

  async getMonitoringSettings(serverId: string): Promise<{
    success: boolean
    data: {
      alertThresholds: {
        cpu: number
        memory: number
        disk: number
      }
      refreshInterval: number
      enableEmailAlerts: boolean
      alertEmail: string
    }
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/server/${serverId}/settings`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching monitoring settings:', error)

      // Return default settings for development
      return {
        success: true,
        data: {
          alertThresholds: {
            cpu: 80,
            memory: 85,
            disk: 90,
          },
          refreshInterval: 30,
          enableEmailAlerts: false,
          alertEmail: '',
        },
      }
    }
  }

  async getHistoricalData(
    serverId: string,
    metric: 'cpu' | 'memory' | 'disk' | 'network',
    timeRange: '1h' | '6h' | '24h' | '7d' | '30d',
  ): Promise<{
    success: boolean
    data: Array<{
      timestamp: string
      value: number
    }>
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/server/${serverId}/history?metric=${metric}&range=${timeRange}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching historical data:', error)

      // Return mock historical data for development
      const mockData = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(
          Date.now() - (23 - i) * 60 * 60 * 1000,
        ).toISOString(),
        value: Math.random() * 100,
      }))

      return {
        success: true,
        data: mockData,
      }
    }
  }
}

// Export singleton instance
export const defaultMonitoring = new DefaultMonitoringAPI()

// Export types for use in components
export type { MonitoringParams, MonitoringResponse }
