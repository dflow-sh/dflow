'use client'

import { Loader2, MoreHorizontal, RefreshCcw } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { getSystemStatsAction } from '@/actions/beszel'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { System } from '@/lib/beszel/types'
import { ServerType } from '@/payload-types-overrides'

import DefaultCurrentResourceUsage from './DefaultCurrentResourceUsage'
import DefaultMonitoringTabs from './DefaultMonitoringTabs'
import DefaultSystemInfo from './DefaultSystemInfo'
import DefaultTimeRangeSelector from './DefaultTimeRangeSelector'

interface DefaultMonitoringProps {
  server: ServerType
  isSshConnected: boolean
}

const DefaultMonitoring = ({
  server,
  isSshConnected,
}: DefaultMonitoringProps) => {
  const [isDataRefreshing, setIsDataRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Time range selection state
  const [timeRange, setTimeRange] = useState({
    type: '1m' as '1m' | '10m' | '20m' | '120m' | '480m',
    from: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Default 1 hour ago
  })

  const [serverSystemData, setServerSystemData] = useState<System | null>(null)

  // Enhanced monitoring state with historical data
  const [monitoringData, setMonitoringData] = useState({
    systemInfo: {
      status: 'loading',
      uptime: '--',
      version: '--',
      hostname: '--',
      kernel: '--',
      model: '--',
      cores: 0,
      threads: 0,
    },
    resources: {
      cpu: { usage: 0, cores: 0 },
      memory: { used: 0, total: 0, percentage: 0 },
      disk: { used: 0, total: 0, percentage: 0 },
      network: { bytesIn: 0, bytesOut: 0 },
    },
    historicalData: {
      cpu: [] as Array<{
        timestamp: string
        fullTimestamp: string
        usage: number
        loadAvg?: number[]
      }>,
      memory: [] as Array<{
        timestamp: string
        fullTimestamp: string
        usage: number
        used: number
        total: number
      }>,
      disk: [] as Array<{
        timestamp: string
        fullTimestamp: string
        usage: number
        used: number
        total: number
        reads?: number
        writes?: number
      }>,
      network: [] as Array<{
        timestamp: string
        fullTimestamp: string
        incoming: number
        outgoing: number
        bandwidth?: number[]
      }>,
    },
    services: [],
  })

  // Action for fetching system stats
  const {
    execute: getSystemStats,
    isPending: isSystemStatsPending,
    result: systemStatsResult,
  } = useAction(getSystemStatsAction, {
    onSuccess: ({ data }) => {
      console.log(data)
      if (data?.success && data.data?.system) {
        setServerSystemData(data.data.system)
      }

      if (
        !data?.success ||
        !data.data?.stats?.items ||
        data.data.stats.items.length === 0
      ) {
        toast.warning(
          'No monitoring data available for the selected time range',
        )
        setMonitoringData(prev => ({
          ...prev,
          systemInfo: {
            ...prev.systemInfo,
            status: 'warning',
          },
        }))
        return
      }

      const items = data.data.stats.items
      const systemInfo = data.data.system?.info || {}

      // Process historical data for charts
      const processedCpuData = items.map(item => ({
        timestamp: new Date(item.created).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC',
        }),
        fullTimestamp: new Date(item.created).toLocaleString(),
        usage: Math.round((item.stats.cpu || 0) * 100) / 100,
        loadAvg: item.stats.la || [0, 0, 0],
      }))

      const processedMemoryData = items.map(item => ({
        timestamp: new Date(item.created).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC',
        }),
        fullTimestamp: new Date(item.created).toLocaleString(),
        usage: Math.round((item.stats.mp || 0) * 100) / 100,
        used: Math.round((item.stats.mu || 0) * 100) / 100,
        total: Math.round((item.stats.m || 0) * 100) / 100,
      }))

      const processedDiskData = items.map(item => ({
        timestamp: new Date(item.created).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC',
        }),
        fullTimestamp: new Date(item.created).toLocaleString(),
        usage: Math.round((item.stats.dp || 0) * 100) / 100,
        used: Math.round((item.stats.du || 0) * 100) / 100,
        total: Math.round((item.stats.d || 0) * 100) / 100,
        // Convert MB/s to bytes/s for proper formatting
        reads: Math.round((item.stats.dr || 0) * 1024 * 1024),
        writes: Math.round((item.stats.dw || 0) * 1024 * 1024),
      }))

      const processedNetworkData = items.map(item => {
        // Prefer 'b' bandwidth array if available, otherwise use nr/ns
        let incoming = 0
        let outgoing = 0

        if (item.stats.b && item.stats.b.length >= 2) {
          // Convert KB to bytes
          incoming = Math.round((item.stats.b[0] || 0) * 1024)
          outgoing = Math.round((item.stats.b[1] || 0) * 1024)
        } else {
          // Fallback to nr/ns if 'b' is missing
          incoming = Math.round((item.stats.nr || 0) * 1024)
          outgoing = Math.round((item.stats.ns || 0) * 1024)
        }

        return {
          timestamp: new Date(item.created).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
          }),
          fullTimestamp: new Date(item.created).toLocaleString(),
          incoming,
          outgoing,
          bandwidth: item.stats.b || [0, 0],
        }
      })

      const latestStats = items[items.length - 1]
      if (latestStats?.stats) {
        const stats = latestStats.stats

        // Calculate server status based on metrics
        let status = 'online'
        const cpuUsage = Math.round(stats.cpu * 100) / 100
        const memUsage = Math.round(stats.mp * 100) / 100
        const diskUsage = Math.round(stats.dp * 100) / 100

        if (cpuUsage > 90) status = 'warning'
        if (memUsage > 90 || diskUsage > 90) status = 'warning'
        if (memUsage > 95 || diskUsage > 95) status = 'error'

        // Calculate network values using same logic as historical
        let currentIncoming = 0
        let currentOutgoing = 0
        if (stats.b && stats.b.length >= 2) {
          currentIncoming = Math.round((stats.b[0] || 0) * 1024)
          currentOutgoing = Math.round((stats.b[1] || 0) * 1024)
        } else {
          currentIncoming = Math.round((stats.nr || 0) * 1024)
          currentOutgoing = Math.round((stats.ns || 0) * 1024)
        }

        // Format uptime
        const uptimeSeconds = systemInfo.u || 0
        const uptimeFormatted =
          uptimeSeconds >= 86400
            ? `${Math.floor(uptimeSeconds / 86400)} days`
            : `${Math.floor(uptimeSeconds / 3600)} hours`

        // Update current monitoring data with proper conversions
        setMonitoringData(prev => ({
          ...prev,
          systemInfo: {
            status: status,
            hostname: server.name || server.hostname || '--',
            kernel: systemInfo.k || '--',
            model: systemInfo.m || '--',
            cores: systemInfo.c || 0,
            threads: systemInfo.t || 0,
            version: systemInfo.v || '--',
            uptime: uptimeFormatted,
          },
          resources: {
            cpu: {
              usage: cpuUsage || 0,
              cores: systemInfo.c || 0,
            },
            memory: {
              used: Math.round(stats.mu * 100) / 100 || 0,
              total: Math.round(stats.m * 100) / 100 || 0,
              percentage: memUsage || 0,
            },
            disk: {
              used: Math.round(stats.du * 100) / 100 || 0,
              total: Math.round(stats.d * 100) / 100 || 0,
              percentage: diskUsage || 0,
            },
            network: {
              bytesIn: currentIncoming,
              bytesOut: currentOutgoing,
            },
          },
          historicalData: {
            cpu: processedCpuData,
            memory: processedMemoryData,
            disk: processedDiskData,
            network: processedNetworkData,
          },
        }))

        setLastUpdated(new Date().toLocaleTimeString())
      }
    },
    onError: ({ error }) => {
      console.error('Error fetching system stats:', error)
      toast.error('Failed to fetch system stats')
      setMonitoringData(prev => ({
        ...prev,
        systemInfo: {
          ...prev.systemInfo,
          status: 'error',
        },
      }))
    },
  })

  // Function to fetch monitoring data using action
  const fetchMonitoringData = useCallback(async () => {
    try {
      getSystemStats({
        serverName: server.name,
        host:
          server.preferConnectionType === 'ssh'
            ? (server.ip ?? '')
            : (server.publicIp ?? ''),
        type: timeRange.type,
        from: timeRange.from,
      })
    } catch (error) {
      console.error('Error executing system stats action:', error)
    }
  }, [
    getSystemStats,
    server.name,
    server.ip,
    server.publicIp,
    server.preferConnectionType,
    timeRange.type,
    timeRange.from,
  ])

  // Function to clear and reset the interval
  const resetInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => refreshData(false), 60000)
  }, [])

  // Wrap refreshData in useCallback
  const refreshData = useCallback(
    async (isManual = false) => {
      setIsDataRefreshing(true)
      try {
        await fetchMonitoringData()

        if (isManual) {
          resetInterval()
          toast.success('Monitoring data refreshed')
        }
      } catch (error) {
        if (isManual) {
          toast.error('Failed to refresh monitoring data')
        }
        console.error('Error refreshing data:', error)
      } finally {
        setIsDataRefreshing(false)
      }
    },
    [fetchMonitoringData, resetInterval],
  )

  // Updated useEffect for initial setup and cleanup
  useEffect(() => {
    refreshData()
    resetInterval()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [refreshData, resetInterval])

  // Handle time range changes
  const handleTimeRangeChange = useCallback(
    (newType: string, newFrom: string) => {
      setTimeRange({
        type: newType as '1m' | '10m' | '20m' | '120m' | '480m',
        from: newFrom,
      })
    },
    [],
  )

  // Update data when time range changes
  useEffect(() => {
    refreshData()
  }, [timeRange])

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <h4 className='mb-2 text-lg font-bold'>
            Enhanced Monitoring Dashboard
          </h4>
          <p className='text-muted-foreground'>
            Real-time server metrics with historical data visualization
          </p>
        </div>

        {/* Desktop Action Icons */}
        <div className='hidden items-center space-x-2 md:flex'>
          <DefaultTimeRangeSelector
            currentType={timeRange.type}
            onTimeRangeChange={handleTimeRangeChange}
          />

          <Button
            disabled={isDataRefreshing || isSystemStatsPending}
            variant='secondary'
            onClick={() => refreshData(true)}>
            {isDataRefreshing || isSystemStatsPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <RefreshCcw className='h-4 w-4' />
            )}
            {isDataRefreshing || isSystemStatsPending
              ? 'Refreshing...'
              : 'Refresh Data'}
          </Button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className='md:hidden'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='icon'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={() => refreshData(true)}
                disabled={isDataRefreshing || isSystemStatsPending}>
                {isDataRefreshing || isSystemStatsPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <RefreshCcw className='h-4 w-4' />
                )}
                <span>
                  {isDataRefreshing || isSystemStatsPending
                    ? 'Refreshing...'
                    : 'Refresh Data'}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Last Updated Info with Loading Icon */}
      <div className='flex items-center text-sm text-muted-foreground'>
        {(isDataRefreshing || isSystemStatsPending) && (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        )}
        <p>Last updated at: {lastUpdated || 'Fetching...'}</p>
      </div>

      {/* System Information */}
      <DefaultSystemInfo
        monitoringData={monitoringData}
        systemData={serverSystemData}
      />

      {/* Current Resource Usage */}
      <DefaultCurrentResourceUsage
        monitoringData={monitoringData}
        systemStatsResult={systemStatsResult}
      />

      {/* Tabs for detailed charts */}
      <DefaultMonitoringTabs
        historicalData={monitoringData.historicalData}
        timeRange={timeRange}
      />
    </div>
  )
}

export default DefaultMonitoring
