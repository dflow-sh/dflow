'use client'

import { FileText } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import ServerTerminal with ssr: false
const LogsTab = dynamic(() => import('@core/components/service/LogsTab'), {
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
      <div className='mb-4 flex items-center gap-1.5'>
        <FileText />
        <h4 className='text-lg font-semibold'>Logs</h4>
      </div>
      <LogsTab serverId={serverId} serviceId={serviceId} />
    </>
  )
}

export default LogsTabClient
