'use client'

import dynamic from 'next/dynamic'

// Dynamically import ServerTerminal with ssr: false
const LogsTab = dynamic(() => import('@/components/service/LogsTab'), {
  ssr: false,
})

const LogsTabClient = ({
  serverId,
  serviceId,
}: {
  serverId: string
  serviceId: string
}) => {
  return <LogsTab serverId={serverId} serviceId={serviceId} />
}

export default LogsTabClient
