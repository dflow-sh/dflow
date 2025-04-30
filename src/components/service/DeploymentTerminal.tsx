'use client'

import XTermTerminal from '../XTermTerminal'
import { SquareTerminal } from 'lucide-react'
import React, { useEffect, useRef } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import useXterm from '@/hooks/use-xterm'
import { Deployment } from '@/payload-types'

const TerminalContent = ({
  logs,
  serviceId,
  serverId,
}: {
  serviceId: string
  serverId: string
  logs: unknown[]
}) => {
  const eventSourceRef = useRef<EventSource>(null)
  const { terminalRef, writeLog, terminalInstance } = useXterm()

  useEffect(() => {
    if (!!logs.length) {
      eventSourceRef.current?.close()
      return
    }

    if (!terminalInstance) {
      return
    }

    const eventSource = new EventSource(
      `/api/server-events?serviceId=${serviceId}&serverId=${serverId}`,
    )

    eventSource.onmessage = event => {
      const data = JSON.parse(event.data) ?? {}

      if (data?.message) {
        const formattedLog = `${data?.message}`
        writeLog({ message: formattedLog })
      }
    }

    eventSourceRef.current = eventSource

    return () => {
      eventSource.close()
    }
  }, [terminalInstance])

  useEffect(() => {
    if (!!logs.length && terminalInstance) {
      if (terminalRef.current) {
        logs.forEach(log => {
          writeLog({ message: `${log}` })
        })
      }
    }
  }, [terminalInstance, logs, writeLog])

  return <XTermTerminal ref={terminalRef} />
}

const DeploymentTerminal = ({
  children,
  deployment,
  serviceId,
  serverId,
  logs,
}: {
  children: React.ReactNode
  deployment: Deployment
  serviceId: string
  serverId: string
  logs: unknown[]
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className='max-w-5xl'>
        <DialogHeader>
          <DialogTitle className='mb-2 flex items-center gap-2'>
            <SquareTerminal />
            Deployment Logs
          </DialogTitle>

          <DialogDescription className='sr-only'>
            These are deployment logs of {deployment.id}
          </DialogDescription>
        </DialogHeader>

        <TerminalContent
          serverId={serverId}
          serviceId={serviceId}
          logs={logs}
        />
      </DialogContent>
    </Dialog>
  )
}

export default DeploymentTerminal
