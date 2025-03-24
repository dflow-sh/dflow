'use client'

import Terminal from '../Terminal'
import { SquareTerminal } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Deployment } from '@/payload-types'

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
  const [messages, setMessages] = useState<string[]>([])
  const [open, setOpen] = useState<boolean>(false)
  const eventSourceRef = useRef<EventSource>(null)

  useEffect(() => {
    if (!!logs.length) {
      setMessages(logs as string[])
      eventSourceRef.current?.close()
      return
    }

    if (!open || eventSourceRef.current) {
      return
    }

    const eventSource = new EventSource(
      `/api/server-events?serviceId=${serviceId}&serverId=${serverId}`,
    )

    eventSource.onmessage = event => {
      const data = JSON.parse(event.data) ?? {}

      if (data?.message) {
        setMessages(prev => [...prev, data.message])
      }
    }

    eventSourceRef.current = eventSource
  }, [open, logs])

  useEffect(() => {
    // On component unmount close the event source
    return () => {
      if (eventSourceRef.current) {
        setMessages([])
        eventSourceRef.current.close()
      }
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        <Terminal
          messages={messages}
          isLoading={!logs.length}
          className='min-h-[70vh] w-full overflow-x-hidden'
        />
      </DialogContent>
    </Dialog>
  )
}

export default DeploymentTerminal
