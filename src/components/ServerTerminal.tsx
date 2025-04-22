'use client'

import { ChevronsUp, HardDrive, SquareTerminal } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

import Tabs from './Tabs'
import TerminalComponent from './Terminal'

const ServerTerminal = ({
  servers = [],
}: {
  servers: {
    id: string
    name: string
  }[]
}) => {
  // Store messages for each server in an object with server IDs as keys
  const [serverMessages, setServerMessages] = useState<
    Record<string, string[]>
  >({})
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  // Use a ref to store event sources so they persist between renders
  const eventSourcesRef = useRef<Record<string, EventSource>>({})
  // Track which servers we've already connected to
  const connectedServersRef = useRef<Set<string>>(new Set())

  // Function to create an SSE connection for a specific server
  const connectToServer = (serverId: string) => {
    // Skip if we already have a connection for this server
    if (connectedServersRef.current.has(serverId)) return

    const eventSource = new EventSource(
      `/api/server-events?serverId=${serverId}`,
    )

    eventSource.onmessage = event => {
      const data = JSON.parse(event.data) ?? {}

      if (data?.message) {
        setServerMessages(prev => ({
          ...prev,
          [serverId]: [...(prev[serverId] || []), data.message],
        }))
      }
    }

    // Store the event source in our ref
    eventSourcesRef.current[serverId] = eventSource
    // Mark this server as connected
    connectedServersRef.current.add(serverId)

    console.log(`Connected to server: ${serverId}`)
  }

  // Clean up function to close all connections
  const cleanupConnections = () => {
    console.log('Cleaning up all connections...')

    Object.values(eventSourcesRef.current).forEach(eventSource => {
      console.log('Closing connection:', eventSource)
      eventSource.close()
    })

    eventSourcesRef.current = {}
    connectedServersRef.current.clear()
    setServerMessages({})

    console.log('All connections closed')
  }

  // Connect to the first server when drawer opens
  useEffect(() => {
    if (
      open &&
      servers.length > 0 &&
      !connectedServersRef.current.has(servers[0].id)
    ) {
      connectToServer(servers[0].id)
    }
  }, [open, servers])

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

  // // Connect to a server when its tab becomes active
  useEffect(() => {
    if (open && servers.length > 0 && activeTab < servers.length) {
      const currentServerId = servers[activeTab].id
      connectToServer(currentServerId)
    }
  }, [activeTab, open, servers])

  const tabs = useMemo(() => {
    return servers.map((server, index) => ({
      label: (
        <span className='flex items-center gap-2 text-sm'>
          <HardDrive size={16} />
          {server.name}
        </span>
      ),
      content: () => (
        <TerminalComponent
          className='mt-8'
          messages={serverMessages[server.id] || []}
        />
      ),
    }))
  }, [servers, serverMessages])

  const handleTabChange = (index: number) => {
    setActiveTab(index)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-0 right-0 z-50 flex w-full items-center justify-between border-t bg-secondary/50 px-3 py-2 backdrop-blur-lg transition-[width] duration-200 ease-linear hover:bg-secondary/70',
          // state === 'expanded'
          //   ? 'md:w-[calc(100%-var(--sidebar-width))]'
          //   : 'md:w-[calc(100%-var(--sidebar-width-icon))]',
        )}>
        <div className='flex items-center gap-2 text-sm'>
          <SquareTerminal size={16} /> Console
        </div>

        <ChevronsUp size={20} />
      </button>

      <Sheet
        open={open}
        onOpenChange={state => {
          setOpen(state)
          if (!state) {
            cleanupConnections()
          }
        }}>
        <SheetContent side='bottom'>
          <SheetHeader className='sr-only'>
            <SheetTitle>Console</SheetTitle>
            <SheetDescription>All console logs appear here</SheetDescription>
          </SheetHeader>

          {servers.length ? (
            <Tabs tabs={tabs} onTabChange={handleTabChange} />
          ) : (
            <p className='text-center'>No Severs Found!</p>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

export default ServerTerminal
