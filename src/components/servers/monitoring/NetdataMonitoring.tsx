'use client'

import { Loader2, MoreHorizontal, RefreshCcw, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { uninstallNetdataAction } from '@/actions/netdata'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { netdata } from '@/lib/netdata'
import { ServerType } from '@/payload-types-overrides'

import CurrentResourceUsage from './CurrentResourceUsage'
import MonitoringTabs from './MonitoringTabs'
import StatusOverView from './StatusOverView'

const NetdataMonitoring = ({ server }: { server: ServerType }) => {
  const router = useRouter()

  // State for server status
  const [serverStatus, setServerStatus] = useState({
    status: 'loading',
    uptime: '--',
    lastIncident: '--',
    activeAlerts: 0,
  })

  const [isDataRefreshing, setIsDataRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null) // Last updated time

  // Add a ref to track the interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [dashboardMetrics, setDashboardMetrics] = useState({
    overview: {},
    detailed: {},
  })

  // Function to fetch server status
  const fetchServerStatus = useCallback(async () => {
    try {
      const response = await netdata.system.getServerDashboardStatus({
        host:
          server.preferConnectionType === 'ssh'
            ? (server.ip ?? '')
            : (server.publicIp ?? ''),
      })

      if (response) {
        setServerStatus({
          status: response?.data?.serverStatus?.status || 'unknown',
          uptime: response?.data?.serverStatus?.uptime || '--',
          lastIncident:
            response?.data?.serverStatus?.lastIncident || 'No incidents',
          activeAlerts: response?.data?.serverStatus?.activeAlerts || 0,
        })
      }
    } catch (error) {
      console.log('Error fetching server status:', error)
      setServerStatus(prev => ({
        ...prev,
        status: 'error',
      }))
    }
  }, [server.ip])

  // Function to fetch dashboard metrics
  const fetchDashboardMetrics = useCallback(async () => {
    try {
      const response = await netdata.metrics.getDashboardMetrics({
        host:
          server.preferConnectionType === 'ssh'
            ? (server.ip ?? '')
            : (server.publicIp ?? ''),
      })

      if (response.success) {
        setDashboardMetrics(response.data)
        setLastUpdated(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.log('Error fetching dashboard metrics:', error)
    }
  }, [server.ip])

  // Function to clear and reset the interval
  const resetInterval = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up a new interval
    intervalRef.current = setInterval(() => refreshData(false), 60000)
  }, [])

  // Wrap refreshData in useCallback
  const refreshData = useCallback(
    async (isManual = false) => {
      setIsDataRefreshing(true)
      try {
        await Promise.allSettled([fetchServerStatus(), fetchDashboardMetrics()])

        if (isManual) {
          // Reset interval when manually refreshed
          resetInterval()
          toast.success('Data refreshed successfully')
        }
      } catch (error) {
        if (isManual) {
          toast.error('Failed to refresh data')
        }
        console.error('Error refreshing data:', error)
      } finally {
        setIsDataRefreshing(false)
      }
    },
    [fetchServerStatus, fetchDashboardMetrics, resetInterval],
  )

  // Updated useEffect for initial setup and cleanup
  useEffect(() => {
    // Fetch initial data
    refreshData()

    // Set up initial polling interval
    resetInterval()

    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [refreshData, resetInterval])

  // Action handlers
  const {
    execute: queueUninstallNetdata,
    isPending: isUninstallingNetdata,
    hasSucceeded: uninstallTriggered,
  } = useAction(uninstallNetdataAction, {
    onSuccess: () => {
      toast.info('Added to queue', {
        description: 'added uninstall Monitoring Tools to queue',
      })
    },
    onError: ({ error }) => {
      toast.error(
        `Failed to queue Monitoring Tools uninstall: ${error.serverError || 'Unknown error'}`,
      )
    },
  })

  const handleUninstall = () => {
    queueUninstallNetdata({ serverId: server.id })
  }

  return (
    <div>
      <div className='mb-6 flex items-start justify-between'>
        <div>
          <h4 className='mb-2 text-lg font-bold'>
            Server Monitoring Dashboard
          </h4>

          <p className='text-muted-foreground'>
            Real-time performance metrics and server status
          </p>
        </div>

        {/* Desktop Action Icons */}
        <div className='hidden items-center space-x-2 md:flex'>
          <Button
            disabled={isDataRefreshing}
            variant='secondary'
            onClick={() => refreshData(true)}>
            {isDataRefreshing ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <RefreshCcw className='h-4 w-4' />
            )}
            {isDataRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>

          <Button
            disabled={isUninstallingNetdata || uninstallTriggered}
            isLoading={isUninstallingNetdata}
            onClick={handleUninstall}
            variant='destructive'>
            <Trash2 className='h-4 w-4' />

            {uninstallTriggered ? 'Uninstalling...' : 'Uninstall'}
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
                disabled={isDataRefreshing}>
                {isDataRefreshing ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <RefreshCcw className='h-4 w-4' />
                )}
                <span>
                  {isDataRefreshing ? 'Refreshing...' : 'Refresh Data'}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleUninstall}
                disabled={isUninstallingNetdata || uninstallTriggered}
                className='text-destructive'>
                {isUninstallingNetdata ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Trash2 className='h-4 w-4' />
                )}
                <span>
                  {isUninstallingNetdata ? 'Queuing Uninstall...' : 'Uninstall'}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Last Updated Info with Loading Icon */}
      <div className='mb-4 flex items-center text-sm text-muted-foreground'>
        {isDataRefreshing && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        <p>Last updated at: {lastUpdated || 'Fetching...'}</p>
      </div>

      {/* Status Overview */}
      <StatusOverView
        serverStatus={serverStatus}
        dashboardMetrics={dashboardMetrics as any}
      />

      {/* Current Resource Usage */}
      <CurrentResourceUsage dashboardMetrics={dashboardMetrics as any} />

      {/* Tabs for detailed charts */}
      <MonitoringTabs dashboardMetrics={dashboardMetrics as any} />
    </div>
  )
}

export default NetdataMonitoring
