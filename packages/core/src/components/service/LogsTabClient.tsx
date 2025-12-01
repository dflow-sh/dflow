'use client'

import dynamic from 'next/dynamic'
import { FileText } from 'lucide-react'

// Dynamically import ServerTerminal with ssr: false
const LogsTab = dynamic(() => import('@dflow/core/components/service/LogsTab'), {
  ssr: false,
})

const LogsTabClient = ({
  serverId,
  serviceId,
}: {
  serverId: string
  serviceId: string
}) => {
  return (
    <>
      <div className='flex items-center gap-1.5 mb-4'>
        <FileText />
        <h4 className='text-lg font-semibold'>Logs</h4>
      </div>
      <LogsTab serverId={serverId} serviceId={serviceId} />
    </>
  )
}

export default LogsTabClient
