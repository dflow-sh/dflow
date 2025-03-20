'use client'

import { Button } from '../ui/button'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { uninstallNetdataAction } from '@/actions/netdata'
import { netdata } from '@/lib/netdata'
import { ServerType } from '@/payload-types-overrides'

import CurrentResourceUsage from './CurrentResourceUsage'
import MonitoringTabs from './MonitoringTabs'
import StatusOverView from './StatusOverView'

const Monitoring = ({ server }: { server: ServerType }) => {
  const router = useRouter()

  // State for server metrics
  const [serverStatus, setServerStatus] = useState({
    status: 'loading',
    uptime: '--',
    lastIncident: '--',
    activeAlerts: 0,
  })

  const [dashboardMetrics, setDashboardMetrics] = useState({
    cpuData: [],
    cpuUsageDistributionData: [],
    memoryData: [],
    networkData: [],
    diskSpaceData: [],
    diskIOData: [],
    diskVolumesData: [],
    inodeUsageData: [],
    serverLoadData: [],
    requestData: [],
    responseTimeData: [],
  })

  const {
    cpuData,
    cpuUsageDistributionData,
    diskSpaceData,
    diskIOData,
    diskVolumesData,
    inodeUsageData,
    memoryData,
    networkData,
    requestData,
    responseTimeData,
    serverLoadData,
  } = dashboardMetrics

  // Disk Space Data
  const dummyDiskSpaceData = [
    { name: 'Used', value: 68 },
    { name: 'Free', value: 32 },
  ]

  // Disk Volumes Data
  const dummyDiskVolumesData = [
    { name: '/', used: 75, total: 100 },
    { name: '/home', used: 45, total: 100 },
    { name: '/var', used: 25, total: 50 },
    { name: '/tmp', used: 5, total: 20 },
  ]

  // Inode Usage Data
  const dummyInodeUsageData = [
    { name: '/', used: 45 },
    { name: '/home', used: 35 },
    { name: '/var', used: 65 },
    { name: '/tmp', used: 15 },
  ]

  const dummyCpuUsageDistributionData = [
    { name: 'Core 1', usage: 65 },
    { name: 'Core 2', usage: 85 },
    { name: 'Core 3', usage: 72 },
    { name: 'Core 4', usage: 78 },
    { name: 'Core 5', usage: 62 },
    { name: 'Core 6', usage: 90 },
    { name: 'Core 7', usage: 45 },
    { name: 'Core 8', usage: 68 },
  ]

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
      const response = await netdata.system.getDashboardMetrics({
        host: server.ip,
      })

      if (response) {
        // Process and transform the API response into chart data
        setDashboardMetrics({
          cpuData: response?.data?.cpuData || [],
          cpuUsageDistributionData:
            response?.data?.cpuUsageDistribution ||
            dummyCpuUsageDistributionData,
          memoryData: response?.data?.memoryData || [],
          networkData: response?.data?.networkData || [],
          diskSpaceData: response?.data?.diskSpaceData || dummyDiskSpaceData,
          diskIOData: response?.data?.diskIOData || [],
          diskVolumesData:
            response?.data?.diskVolumesData || dummyDiskVolumesData,
          inodeUsageData: response?.data?.inodeUsageData || dummyInodeUsageData,
          serverLoadData: response?.data?.serverLoadData || [],
          requestData: response?.data?.requestData || [],
          responseTimeData: response?.data?.responseTimeData || [],
        })
      }
    } catch (error) {
      console.log('Error fetching dashboard metrics:', error)
    }
  }, [server.ip])

  // Setup polling interval
  useEffect(() => {
    // Fetch initial data
    fetchServerStatus()
    fetchDashboardMetrics()

    // Set up polling every minute (60000 ms)
    const statusInterval = setInterval(fetchServerStatus, 5000)
    const metricsInterval = setInterval(fetchDashboardMetrics, 5000)

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(statusInterval)
      clearInterval(metricsInterval)
    }
  }, [fetchServerStatus, fetchDashboardMetrics])

  const { execute: uninstallNetdata, isPending: isUninstallingNetdata } =
    useAction(uninstallNetdataAction, {
      onSuccess: () => {
        toast.success('Successfully uninstalled netdata')
        router.refresh()
      },
    })

  const handleUninstall = () => {
    uninstallNetdata({ serverId: server.id })
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='mb-2 text-3xl font-bold'>
            Server Monitoring Dashboard
          </h1>
          <p className='text-muted-foreground'>
            Real-time performance metrics and server status
          </p>
        </div>
        <Button variant='destructive' onClick={handleUninstall}>
          Uninstall
        </Button>
      </div>

      {/* Status Overview */}
      <StatusOverView serverStatus={serverStatus} />

      {/* Current Resource Usage */}
      <CurrentResourceUsage
        cpuData={cpuData}
        memoryData={memoryData}
        networkData={networkData}
      />

      {/* Tabs for detailed charts */}
      <MonitoringTabs dashboardMetrics={dashboardMetrics} />
    </div>
  )
}

export default Monitoring
