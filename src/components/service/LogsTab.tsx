'use client'

import XTermTerminal from '../XTermTerminal'
import { useEffect, useRef } from 'react'

import useXterm from '@/hooks/use-xterm'

const LogsTab = ({
  serverId,
  serviceId,
}: {
  serverId: string
  serviceId: string
}) => {
  const eventSourceRef = useRef<EventSource>(null)
  const { terminalRef, writeLog, terminalInstance } = useXterm()

  useEffect(() => {
    if (eventSourceRef.current || !terminalInstance) {
      return
    }

    const eventSource = new EventSource(
      `/api/logs?serviceId=${serviceId}&serverId=${serverId}`,
    )
    eventSource.onmessage = event => {
      const data = JSON.parse(event.data) ?? {}

      if (data?.message) {
        const formattedLog = `${data?.message}`
        writeLog({ message: formattedLog })
      }
    }

    eventSourceRef.current = eventSource

    // On component unmount close the event source
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [terminalInstance])

  return <XTermTerminal ref={terminalRef} />
}

export default LogsTab
