'use client'

import { SquareTerminal } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useTerminal } from '@/providers/ServerTerminalProvider'

import TerminalComponent from './Terminal'
import { Button } from './ui/button'

const ServerTerminal = () => {
  const [messages, setMessages] = useState<string[]>([])

  const { open, setOpen } = useTerminal()

  useEffect(() => {
    if (!open) {
      return
    }

    const eventSource = new EventSource('/api/events')
    eventSource.onmessage = event => {
      setMessages(prev => [...prev, event.data])
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size='icon'
          variant='secondary'
          className='fixed bottom-4 right-4 z-40 size-16 [&_svg]:size-8'>
          <SquareTerminal />
        </Button>
      </SheetTrigger>

      <SheetContent side='bottom'>
        <SheetHeader className='sr-only'>
          <SheetTitle>Terminal Dialog</SheetTitle>
          <SheetDescription>All terminal logs appear here</SheetDescription>
        </SheetHeader>

        <TerminalComponent className='mt-8' messages={messages} />
      </SheetContent>
    </Sheet>
  )
}

export default ServerTerminal
