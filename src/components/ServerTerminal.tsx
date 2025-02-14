'use client'

import { useEffect, useState } from 'react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useTerminal } from '@/providers/ServerTerminalProvider'

import TerminalComponent from './Terminal'

const ServerTerminal = () => {
  const [messages, setMessages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { open, setOpen } = useTerminal()

  useEffect(() => {
    if (!open) {
      return
    }

    const eventSource = new EventSource('/api/events')
    eventSource.onmessage = event => {
      setIsLoading(false)
      setMessages(prev => [...prev, event.data])
    }

    // On component unmount close the event source
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side='bottom'>
        <SheetHeader className='sr-only'>
          <SheetTitle>Terminal Dialog</SheetTitle>
          <SheetDescription>All terminal logs appear here</SheetDescription>
        </SheetHeader>

        <TerminalComponent
          className='mt-8'
          messages={messages}
          isLoading={isLoading}
        />
      </SheetContent>
    </Sheet>
  )
}

export default ServerTerminal
