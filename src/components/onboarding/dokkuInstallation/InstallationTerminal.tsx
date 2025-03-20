import { SquareTerminal } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'

import Terminal from '@/components/Terminal'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const InstallationTerminal = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [server] = useQueryState('server')

  useEffect(() => {
    let eventSource: EventSource | null = null

    if (server && open) {
      eventSource = new EventSource(`/api/server-events?serverId=${server}`)

      eventSource.onmessage = event => {
        const data = JSON.parse(event.data) ?? {}

        if (data?.message) {
          setMessages(prev => [...prev, data.message])
        }
      }
    }

    return () => {
      eventSource?.close()
      setMessages([])
    }
  }, [server, open])

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

        <Terminal className='mt-8' messages={messages} />
      </SheetContent>
    </Sheet>
  )
}

export default InstallationTerminal
