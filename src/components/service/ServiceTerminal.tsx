'use client'

import Terminal from '../Terminal'
import { SquareTerminal } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Deployment } from '@/payload-types'

const ServiceTerminal = ({
  children,
  deployment,
  serviceId,
  serverId,
}: {
  children: React.ReactNode
  deployment: Deployment
  serviceId: string
  serverId: string
}) => {
  const [messages, setMessages] = useState<string[]>([])
  const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    if (!open) {
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

    // On component unmount close the event source
    return () => {
      if (eventSource) {
        setMessages([])
        eventSource.close()
      }
    }
  }, [open])

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

          <Terminal messages={messages} className='min-h-[70vh] w-full' />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default ServiceTerminal
