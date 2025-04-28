'use client'

import { ChevronsUp, HardDrive, SquareTerminal } from 'lucide-react'
import { useEffect, useMemo } from 'react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import useXterm from '@/hooks/use-xterm'
import { cn } from '@/lib/utils'

import Tabs from './Tabs'
import XTermTerminal from './XTermTerminal'

const TerminalContent = ({ serverId }: { serverId: string }) => {
  const { terminalRef, writeLog, terminalInstance } = useXterm()

  useEffect(() => {
    if (!terminalInstance) {
      return
    }

    const eventSource = new EventSource(
      `/api/server-events?serverId=${serverId}`,
    )

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

  return <XTermTerminal ref={terminalRef} className='mt-2 h-80' />
}

const ServerTerminal = ({
  servers = [],
}: {
  servers: {
    id: string
    name: string
  }[]
}) => {
  const tabs = useMemo(() => {
    return servers.map(server => ({
      label: (
        <span className='flex items-center gap-2 text-sm'>
          <HardDrive size={16} />
          {server.name}
        </span>
      ),
      content: () => <TerminalContent serverId={server.id} key={server.id} />,
    }))
  }, [servers])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className={cn(
            'fixed bottom-0 right-0 z-50 flex w-full items-center justify-between border-t bg-secondary/50 px-3 py-2 backdrop-blur-lg transition-[width] duration-200 ease-linear hover:bg-secondary/70',
          )}>
          <div className='flex items-center gap-2 text-sm'>
            <SquareTerminal size={16} /> Console
          </div>

          <ChevronsUp size={20} />
        </button>
      </SheetTrigger>

      <SheetContent side='bottom'>
        <SheetHeader className='sr-only'>
          <SheetTitle>Console</SheetTitle>
          <SheetDescription>All console logs appear here</SheetDescription>
        </SheetHeader>

        {servers.length ? (
          <Tabs tabs={tabs} />
        ) : (
          <p className='text-center'>No Severs Found!</p>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default ServerTerminal
