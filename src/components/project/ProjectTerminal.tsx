import Terminal from '../Terminal'
import { useEffect, useState } from 'react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Server } from '@/payload-types'

type ProjectTerminalType = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  server: Server
}
const ProjectTerminal = ({ open, setOpen, server }: ProjectTerminalType) => {
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    if (!open) {
      return
    }

    const eventSource = new EventSource(
      `/api/server-events?serverId=${server.id}`,
    )

    eventSource.onmessage = event => {
      const data = JSON.parse(event.data) ?? {}

      if (data?.message) {
        setMessages(prev => [...prev, data.message])
      }
    }

    return () => {
      eventSource.close()
      setMessages([])
    }
  }, [open])

  return (
    <Sheet
      open={open}
      onOpenChange={state => {
        setOpen(state)
      }}>
      <SheetContent side='bottom'>
        <SheetHeader>
          <SheetTitle>{`${server.name} console`}</SheetTitle>
          <SheetDescription className='sr-only'>
            {server.name} logs appear here
          </SheetDescription>
        </SheetHeader>

        <Terminal className='mt-2' messages={messages} />
      </SheetContent>
    </Sheet>
  )
}

export default ProjectTerminal
