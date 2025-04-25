import { SquareTerminal } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useEffect } from 'react'

import XTermTerminal from '@/components/XTermTerminal'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
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

const InstallationTerminal = () => {
  return (
    <Sheet>
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

        <TerminalContent />
      </SheetContent>
    </Sheet>
  )
}

export default InstallationTerminal
