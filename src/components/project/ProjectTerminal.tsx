import Terminal from '../Terminal'
import { Badge } from '../ui/badge'
import { useSidebar } from '../ui/sidebar'
import { ChevronsUp, HardDrive, SquareTerminal } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Server } from '@/payload-types'

type ProjectTerminalType = {
  server: Server
}
const ProjectTerminal = ({ server }: ProjectTerminalType) => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const { state } = useSidebar()

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '`' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen(current => !current)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Sheet
      open={open}
      onOpenChange={state => {
        setOpen(state)
      }}>
      <SheetTrigger asChild>
        <button
          tabIndex={0}
          role='button'
          onClick={() => setOpen(true)}
          className={cn(
            'fixed bottom-0 right-0 flex w-full items-center justify-between border-t bg-secondary/50 px-3 py-2 backdrop-blur-lg transition-[width] duration-200 ease-linear hover:bg-secondary/70',
            state === 'expanded'
              ? 'md:w-[calc(100%-var(--sidebar-width))]'
              : 'md:w-[calc(100%-var(--sidebar-width-icon))]',
          )}>
          <div className='flex items-center gap-2 text-sm'>
            <SquareTerminal size={16} /> Console{' - '}
            <Badge variant={'secondary'}>
              <div className='flex items-center gap-x-2'>
                <HardDrive size={16} />
                <span className='text-sm font-medium'>{server.name}</span>
              </div>
            </Badge>
          </div>

          <ChevronsUp size={20} />
        </button>
      </SheetTrigger>
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
