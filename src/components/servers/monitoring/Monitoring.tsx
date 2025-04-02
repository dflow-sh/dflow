'use client'

import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { uninstallNetdataAction } from '@/actions/netdata'
import { netdata } from '@/lib/netdata'
import { ServerType } from '@/payload-types-overrides'

import CurrentResourceUsage from './CurrentResourceUsage'
import MonitoringTabs from './MonitoringTabs'
import StatusOverView from './StatusOverView'

const Monitoring = ({ server }: { server: ServerType }) => {
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
        host: server.ip,
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
        host: server.ip,
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

  useEffect(() => {
    refreshData()
    resetInterval()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [refreshData, resetInterval])

  const { execute: queueUninstallNetdata, isPending: isUninstallingNetdata } =
    useAction(uninstallNetdataAction, {
      onSuccess: () => {
        toast.success('Uninstall Netdata job added to queue')
        router.refresh()
      },
      onError: (error: any) => {
        toast.error(
          `Failed to queue Netdata uninstall: ${error.message || 'Unknown error'}`,
        )
      },
    })

  const handleUninstall = () => {
    queueUninstallNetdata({ serverId: server.id })
  }

  return (
    <div>
      <StatusOverView serverStatus={serverStatus} />
      <CurrentResourceUsage dashboardMetrics={dashboardMetrics} />
      <MonitoringTabs dashboardMetrics={dashboardMetrics as any} />
    </div>
  )
}

export default Monitoring
