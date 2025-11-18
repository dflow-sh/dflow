'use client'

import { useQueryState } from 'nuqs'
import { useEffect } from 'react'

import XTermTerminal from '@/components/XTermTerminal'
import useXterm from '@/hooks/use-xterm'

const TerminalContent = () => {
  const [server] = useQueryState('server')
  const { terminalRef, writeLog, terminalInstance } = useXterm()

  useEffect(() => {
    if (!terminalInstance) {
      return
    }

    const eventSource = new EventSource(`/api/server-events?serverId=${server}`)

    eventSource.onmessage = event => {
      const data = JSON.parse(event.data) ?? {}

      if (data?.message) {
        const formattedLog = `${data?.message}`
        writeLog({ message: formattedLog })
      }
    }

    return () => {
      eventSource.close()
    }
  }, [terminalInstance])

  return <XTermTerminal ref={terminalRef} className='mt-8 h-80' />
}

export default TerminalContent
