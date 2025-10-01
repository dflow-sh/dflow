'use client'

import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  HardDrive,
  Loader2,
  Maximize2,
  Minimize2,
  PictureInPicture,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useBubble } from '@/providers/BubbleProvider'
import { useServers } from '@/providers/ServersProvider'
import { useTerminal } from '@/providers/TerminalProvider'

import { XTermLogViewer } from './XTermLogViewer'
import type { Server } from './bubble-types'

interface TerminalPanelProps {
  mode: 'floating' | 'embedded' | 'fullscreen'
  onClose: () => void
}

interface TerminalContentProps {
  serverId: string
  className?: string
}

const TerminalContent = ({ serverId, className }: TerminalContentProps) => {
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'error'
  >('idle')

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'connecting':
        return 'text-blue-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected'
      case 'error':
        return 'Connection Failed'
      case 'connecting':
        return 'Connecting...'
      default:
        return 'Ready'
    }
  }

  return (
    <div
      className={cn('flex h-full w-full flex-col overflow-hidden', className)}>
      {/* Status Bar */}
      <div className='bg-card flex items-center justify-between border-b px-4 py-2'>
        <div className='flex items-center gap-2'>
          <div
            className={`h-2 w-2 rounded-full ${getStatusColor().replace('text-', 'bg-')}`}
          />
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          {connectionStatus === 'connecting' && (
            <Loader2 size={14} className='animate-spin text-blue-500' />
          )}
        </div>
        <div className='text-muted-foreground text-sm'>Server: {serverId}</div>
      </div>

      {/* XTerm Terminal for Logs */}
      <div
        className='bg-background flex-1 p-4'
        style={{
          backgroundColor: '#334256',
        }}>
        <XTermLogViewer
          serverId={serverId}
          onConnectionStatusChange={setConnectionStatus}
          className='h-full w-full'
        />
      </div>
    </div>
  )
}

const ServerTabs = ({
  servers,
  activeServerId,
  onServerChange,
}: {
  servers: Server[]
  activeServerId: string
  onServerChange: (serverId: string) => void
}) => {
  return (
    <div className='scrollbar-none flex gap-1 overflow-x-auto pb-2'>
      {servers.map(server => (
        <button
          key={server.id}
          onClick={() => onServerChange(server.id)}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
            activeServerId === server.id
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent',
          )}>
          <HardDrive size={14} />
          {server.name}
          {activeServerId === server.id && (
            <div className='h-2 w-2 animate-pulse rounded-full bg-green-500' />
          )}
        </button>
      ))}
    </div>
  )
}

const TerminalPanel = ({ mode = 'floating', onClose }: TerminalPanelProps) => {
  const { goBack } = useBubble()
  const {
    servers,
    loading: loadingServers,
    error: errorServers,
    refresh: refreshServers,
  } = useServers()

  const [activeServerId, setActiveServerId] = useState(servers[0]?.id || '')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  const {
    embeddedHeight,
    setEmbedded,
    setEmbeddedHeight,
    isResizing,
    setIsResizing,
    preferences,
    updatePreference,
  } = useTerminal()

  const resizeStartYRef = useRef<number>(0)
  const resizeStartHeightRef = useRef<number>(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mode === 'embedded') {
      setEmbedded(true)
      adjustMainContentHeight(embeddedHeight)
    } else {
      setEmbedded(false)
      resetMainContentHeight()
    }

    return () => {
      setEmbedded(false)
      resetMainContentHeight()
    }
  }, [mode, embeddedHeight, setEmbedded])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const deltaY = resizeStartYRef.current - e.clientY
      const newHeight = Math.max(
        200,
        Math.min(
          window.innerHeight - 100,
          resizeStartHeightRef.current + deltaY,
        ),
      )

      setEmbeddedHeight(newHeight)
      adjustMainContentHeight(newHeight)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      if (isResizing) {
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isResizing, setEmbeddedHeight])

  useEffect(() => {
    if (servers.length > 0 && !activeServerId) {
      setActiveServerId(servers[0].id)
    }
  }, [servers, activeServerId])

  const adjustMainContentHeight = (height: number) => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.style.height = `calc(100vh - ${height}px)`
    }
  }

  const resetMainContentHeight = () => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.style.height = ''
    }
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    if (mode !== 'embedded') return
    e.preventDefault()
    setIsResizing(true)
    resizeStartYRef.current = e.clientY
    resizeStartHeightRef.current = embeddedHeight
  }

  const toggleFullscreen = () => {
    if (mode === 'fullscreen') {
      updatePreference('terminalMode', 'floating')
      onClose()
    } else {
      updatePreference('terminalMode', 'fullscreen')
    }
  }

  const toggleEmbedded = () => {
    if (mode === 'embedded') {
      updatePreference('terminalMode', 'floating')
      onClose()
    } else {
      updatePreference('terminalMode', 'embedded')
    }
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
    if (!isCollapsed) {
      resetMainContentHeight()
    } else {
      adjustMainContentHeight(embeddedHeight)
    }
  }

  // Fullscreen mode
  if (mode === 'fullscreen') {
    return (
      <div className='bg-background fixed inset-0 z-[100] flex flex-col'>
        <div className='bg-card flex items-center justify-between border-b px-6 py-4'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => {
                updatePreference('terminalMode', 'floating')
                onClose()
              }}
              className='h-8 w-8'>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h2 className='text-xl font-semibold'>
                Server Terminal - Fullscreen
              </h2>
              <p className='text-muted-foreground text-sm'>
                Real-time server logs and monitoring
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Badge variant='secondary' className='text-xs'>
              {servers.length} server{servers.length !== 1 ? 's' : ''}
            </Badge>
            <Button
              variant='outline'
              size='sm'
              onClick={toggleFullscreen}
              className='gap-2'>
              <Minimize2 size={16} />
              Exit Fullscreen
            </Button>
          </div>
        </div>

        <div className='bg-muted/50 border-b px-6 py-3'>
          <ServerTabs
            servers={servers}
            activeServerId={activeServerId}
            onServerChange={setActiveServerId}
          />
        </div>

        <div className='flex-1 overflow-hidden'>
          <TerminalContent serverId={activeServerId} className='h-full' />
        </div>
      </div>
    )
  }

  // Embedded mode - Portal to bottom container
  if (mode === 'embedded' && mounted) {
    const container = document.getElementById('embedded-terminal-container')
    if (!container) return null

    return createPortal(
      <div
        className={cn(
          'bg-background relative border-t shadow-2xl transition-all duration-300 ease-out',
        )}
        style={{
          height: isCollapsed ? '48px' : `${embeddedHeight}px`,
        }}>
        {/* Resize Handle */}
        {!isCollapsed && (
          <div
            className={cn(
              'hover:bg-primary/50 group absolute top-0 right-0 left-0 z-10 flex h-1 cursor-ns-resize items-center justify-center transition-all',
              isResizing ? 'bg-primary' : 'bg-border',
            )}
            onMouseDown={handleResizeStart}>
            <div className='bg-muted-foreground/30 group-hover:bg-primary/60 h-0.5 w-16 rounded-full transition-colors' />
          </div>
        )}

        {/* Header */}
        <div
          className='bg-muted/30 flex items-center justify-between border-b px-4 py-2 backdrop-blur-sm'
          style={{ marginTop: isCollapsed ? '0' : '3px' }}>
          <div className='flex items-center gap-3'>
            <button
              onClick={toggleCollapse}
              className='hover:bg-muted flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors'>
              <HardDrive size={16} className='text-primary' />
              <span>Server Terminal</span>
              {isCollapsed ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {!isCollapsed && (
              <>
                <div className='bg-border h-4 w-px' />
                <Badge variant='secondary' className='text-xs'>
                  {servers.length} server{servers.length !== 1 ? 's' : ''}
                </Badge>
              </>
            )}
          </div>

          <div className='flex items-center gap-1'>
            {!isCollapsed && (
              <>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={toggleFullscreen}
                  className='h-8 gap-1.5 text-xs'>
                  <Maximize2 size={14} />
                  Fullscreen
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    updatePreference('terminalMode', 'floating')
                    onClose()
                  }}
                  className='h-8 gap-1.5 text-xs'>
                  <PictureInPicture size={14} />
                  Floating
                </Button>
              </>
            )}
            <Button
              variant='ghost'
              size='icon'
              onClick={() => {
                updatePreference('terminalMode', 'floating')
                onClose()
              }}
              className='h-8 w-8'>
              <X size={14} />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className='flex h-[calc(100%-48px)] flex-col'>
            <div className='bg-muted/20 border-b px-4 py-2'>
              <ServerTabs
                servers={servers}
                activeServerId={activeServerId}
                onServerChange={setActiveServerId}
              />
            </div>
            <div className='flex-1 overflow-hidden'>
              <TerminalContent serverId={activeServerId} className='h-full' />
            </div>
          </div>
        )}
      </div>,
      container,
    )
  }

  // Floating mode (default)
  if (loadingServers) {
    return (
      <div className='flex h-full flex-col'>
        <div className='border-b p-4'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={goBack}
              className='mr-3 h-8 w-8'>
              <ArrowLeft size={14} />
            </Button>
            <div>
              <h2 className='text-lg font-semibold'>Server Terminal</h2>
              <p className='text-muted-foreground text-xs'>
                Access server terminals
              </p>
            </div>
          </div>
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='text-muted-foreground flex items-center gap-2'>
            <Loader2 size={16} className='animate-spin' />
            <span>Loading servers...</span>
          </div>
        </div>
      </div>
    )
  }

  if (errorServers) {
    return (
      <div className='flex h-full flex-col'>
        <div className='border-b p-4'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={goBack}
              className='mr-3 h-8 w-8'>
              <ArrowLeft size={14} />
            </Button>
            <div>
              <h2 className='text-lg font-semibold'>Server Terminal</h2>
              <p className='text-muted-foreground text-xs'>
                Access server terminals
              </p>
            </div>
          </div>
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='text-muted-foreground text-center'>
            <p>Failed to load servers</p>
            <Button
              variant='outline'
              size='sm'
              onClick={refreshServers}
              className='mt-2'>
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!servers.length) {
    return (
      <div className='flex h-full flex-col'>
        <div className='border-b p-4'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={goBack}
              className='mr-3 h-8 w-8'>
              <ArrowLeft size={14} />
            </Button>
            <div>
              <h2 className='text-lg font-semibold'>Server Terminal</h2>
              <p className='text-muted-foreground text-xs'>
                Access server terminals
              </p>
            </div>
          </div>
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='text-muted-foreground text-center'>
            <HardDrive size={48} className='mx-auto mb-2 opacity-50' />
            <p>No servers available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col'>
      <div className='border-b p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={goBack}
              className='mr-3 h-8 w-8'>
              <ArrowLeft size={14} />
            </Button>
            <div>
              <h2 className='text-lg font-semibold'>Server Terminal</h2>
              <p className='text-muted-foreground text-xs'>
                Access server terminals
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={toggleEmbedded}
              className='h-8 gap-1.5 text-xs'>
              <PictureInPicture size={14} />
              Embed
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={toggleFullscreen}
              className='h-8 gap-1.5 text-xs'>
              <Maximize2 size={14} />
              Fullscreen
            </Button>
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-hidden'>
        <div className='flex h-full flex-col'>
          <div className='bg-muted/10 border-b px-4 py-2'>
            <ServerTabs
              servers={servers}
              activeServerId={activeServerId}
              onServerChange={setActiveServerId}
            />
          </div>

          <div className='flex-1 overflow-hidden'>
            <TerminalContent serverId={activeServerId} className='h-full' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TerminalPanel
