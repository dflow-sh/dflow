'use client'

import Terminal from '../Terminal'
import { useEffect, useState } from 'react'

const LogsTab = ({
  serverId,
  serviceId,
}: {
  serverId: string
  serviceId: string
}) => {
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    if (!open) {
      return
    }

    const eventSource = new EventSource(
      `/api/logs?serviceId=${serviceId}&serverId=${serverId}`,
    )
    eventSource.onmessage = event => {
      const data = JSON.parse(event.data) ?? {}

      if (data?.message) {
        setMessages(prev => [...prev, data.message])
      }
    }

    // On component unmount close the event source
    return () => {
      if (eventSource) {
        setMessages([])
        eventSource.close()
      }
    }
  }, [open])

  return (
    <Terminal
      className='h-[80vh] w-full overflow-x-hidden'
      messages={messages}
    />
  )
}

export default LogsTab
