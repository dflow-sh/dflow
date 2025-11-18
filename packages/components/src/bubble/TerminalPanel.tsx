'use client'

import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  HardDrive,
  Loader2,
  Maximize2,
  PictureInPicture,
  Server as ServerIcon,
  Terminal,
  X,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Badge } from '@dflow/components/ui/badge'
import { Button } from '@dflow/components/ui/button'
import { cn } from '@dflow/lib/utils'
import { Server } from '@dflow/types'
import { useBubble } from '@dflow/providers/BubbleProvider'
import { useServers } from '@dflow/providers/ServersProvider'

const XTermLogViewer = dynamic(
  () => import('@/components/bubble/XTermLogViewer'),
  {
    ssr: false,
  },
)

interface TerminalPanelProps {
  mode: 'floating' | 'embedded' | 'fullscreen'
  isOpen: boolean
  onClose: () => void
  setIsTerminalOpen: (open: boolean) => void
  onModeChange: (mode: 'floating' | 'embedded' | 'fullscreen') => void
  embeddedHeight: number
  onEmbeddedHeightChange: (height: number) => void
}

interface TerminalContentProps {
  serverId: string
  className?: string
  onConnectionStatusChange?: (
    status: 'idle' | 'connecting' | 'connected' | 'error',
  ) => void
}

const TerminalContent = ({
  serverId,
  className,
  onConnectionStatusChange,
}: TerminalContentProps) => {
  return (
    <div
      className={cn('flex h-full w-full flex-col overflow-hidden', className)}>
      <div className='bg-card flex-1 p-3'>
        <XTermLogViewer
          serverId={serverId}
          onConnectionStatusChange={onConnectionStatusChange}
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
  connectionStatus,
  compact = false,
}: {
  servers: Server[]
  activeServerId: string
  onServerChange: (serverId: string) => void
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error'
  compact?: boolean
}) => {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500 animate-pulse'
      case 'error':
        return 'bg-red-500'
      case 'connecting':
        return 'bg-blue-500'
      default:
        return 'bg-muted-foreground'
    }
  }

  return (
    <div className='scrollbar-none flex gap-1 overflow-x-auto'>
      {servers.map(server => {
        const isActive = activeServerId === server.id
        return (
          <button
            key={server.id}
            onClick={() => onServerChange(server.id)}
            className={cn(
              'flex items-center gap-1.5 rounded border whitespace-nowrap transition-colors',
              compact ? 'px-2.5 py-1 text-sm' : 'px-3 py-1.5 text-base',
              isActive
                ? 'bg-primary/10 border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent',
            )}>
            <ServerIcon size={14} />
            {server.name}
            {isActive && (
              <>
                {connectionStatus === 'connecting' ? (
                  <Loader2 size={12} className='text-info animate-spin' />
                ) : (
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${getStatusColor()}`}
                  />
                )}
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}

const LoadingState = () => (
  <div className='flex flex-1 items-center justify-center'>
    <div className='text-muted-foreground flex items-center gap-2'>
      <Loader2 size={16} className='animate-spin' />
      <span>Loading servers...</span>
    </div>
  </div>
)

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className='flex flex-1 items-center justify-center'>
    <div className='text-muted-foreground text-center'>
      <p>Failed to load servers</p>
      <Button variant='outline' size='sm' onClick={onRetry} className='mt-2'>
        Retry
      </Button>
    </div>
  </div>
)

const EmptyState = () => (
  <div className='flex flex-1 items-center justify-center'>
    <div className='text-muted-foreground text-center'>
      <HardDrive size={48} className='mx-auto mb-2 opacity-50' />
      <p>No servers available</p>
    </div>
  </div>
)

const TerminalPanel = ({
  mode = 'floating',
  isOpen,
  onClose,
  setIsTerminalOpen,
  onModeChange,
  embeddedHeight,
  onEmbeddedHeightChange,
}: TerminalPanelProps) => {
  const { goBack } = useBubble()
  const {
    servers,
    loading: loadingServers,
    error: errorServers,
    refresh: refreshServers,
  } = useServers()
  const { serverId } = useParams<{ serverId: string }>()

  const initialServerId =
    serverId && servers.find(s => s.id === serverId) ? serverId : servers[0]?.id

  const [activeServerId, setActiveServerId] = useState(initialServerId || '')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'error'
  >('idle')

  const resizeStartYRef = useRef<number>(0)
  const resizeStartHeightRef = useRef<number>(0)

  useEffect(() => {
    setMounted(true)
  }, [])

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

      onEmbeddedHeightChange(newHeight)
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
  }, [isResizing, onEmbeddedHeightChange])

  useEffect(() => {
    if (serverId && servers.find(s => s.id === serverId)) {
      setActiveServerId(serverId)
    } else if (servers.length > 0 && !activeServerId) {
      setActiveServerId(servers[0].id)
    }
  }, [serverId, servers])

  useEffect(() => {
    if (servers.length > 0 && !activeServerId) {
      setActiveServerId(servers[0].id)
    }
  }, [servers, activeServerId, serverId])

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

  const handleBack = () => {
    if (mode === 'floating') {
      goBack()
    } else {
      onClose()
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

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500 animate-pulse'
      case 'error':
        return 'bg-red-500'
      case 'connecting':
        return 'bg-blue-500'
      default:
        return 'bg-muted-foreground'
    }
  }

  const activeServer = servers.find(s => s.id === activeServerId)

  if (!isOpen) {
    return null
  }

  const renderContent = () => {
    if (loadingServers) {
      return <LoadingState />
    }

    if (errorServers) {
      return <ErrorState onRetry={refreshServers} />
    }

    if (!servers.length) {
      return <EmptyState />
    }

    return (
      <>
        <div
          className={cn(
            'border-b',
            mode === 'fullscreen'
              ? 'bg-muted/50 px-6 py-3'
              : mode === 'embedded'
                ? 'bg-muted/20 px-3 py-1.5'
                : 'bg-muted/10 px-4 py-2',
          )}>
          <ServerTabs
            servers={servers}
            activeServerId={activeServerId}
            onServerChange={setActiveServerId}
            connectionStatus={connectionStatus}
            compact={mode === 'embedded' || mode === 'floating'}
          />
        </div>
        <div className='flex-1 overflow-hidden'>
          <TerminalContent
            serverId={activeServerId}
            className='h-full'
            onConnectionStatusChange={setConnectionStatus}
          />
        </div>
      </>
    )
  }

  if (mode === 'fullscreen' && mounted) {
    return (
      <div className='bg-background fixed inset-0 z-50 flex flex-col'>
        <div className='bg-card flex items-center justify-between border-b px-6 py-4'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => onModeChange('floating')}
              className='h-8 w-8'>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h2 className='text-xl font-semibold'>Console</h2>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {!loadingServers && (
              <Badge variant='secondary' className='text-sm'>
                {servers.length} server{servers.length !== 1 ? 's' : ''}
              </Badge>
            )}
            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onModeChange('embedded')}
                className='h-8 gap-1.5 text-sm'>
                <Terminal size={14} />
                Embedded
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={onClose}
                className='h-8 w-8'>
                <X size={14} />
              </Button>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    )
  }

  if (mode === 'embedded' && mounted) {
    const container = document.getElementById('embedded-terminal-container')
    if (!container) return null

    return createPortal(
      <div
        className={cn(
          'bg-background relative z-50 border-t shadow-2xl transition-all duration-300 ease-out',
        )}
        style={{
          height: isCollapsed ? '42px' : `${embeddedHeight}px`,
        }}>
        {!isCollapsed && (
          <div
            className={cn(
              'hover:bg-primary/50 group absolute top-0 right-0 left-0 z-10 flex h-[1px] cursor-ns-resize items-center justify-center transition-all',
              isResizing ? 'bg-primary' : 'bg-border',
            )}
            onMouseDown={handleResizeStart}>
            <div
              className={cn(
                'bg-border group-hover:bg-primary flex h-[5px] w-16 items-center justify-center rounded-full',
                isResizing ? 'bg-primary' : 'bg-border',
              )}
            />
          </div>
        )}

        <div className='bg-muted/30 flex h-10 items-center justify-between border-b px-3 py-2 backdrop-blur-sm'>
          <div className='flex items-center gap-2.5'>
            <button
              onClick={toggleCollapse}
              className='hover:bg-muted flex items-center gap-2 rounded px-2 py-1 text-sm font-medium transition-colors'>
              <Terminal size={15} className='text-muted-foreground' />
              <span>Console</span>
              {isCollapsed ? (
                <ChevronUp size={15} />
              ) : (
                <ChevronDown size={15} />
              )}
            </button>

            {isCollapsed && activeServer && (
              <>
                <div className='bg-border h-3 w-px' />
                <div className='bg-primary/10 border-primary/20 flex items-center gap-1.5 rounded border px-2 py-0.5 text-sm'>
                  <HardDrive size={12} />
                  {activeServer.name}
                  {connectionStatus === 'connecting' ? (
                    <Loader2 size={11} className='text-info animate-spin' />
                  ) : (
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${getStatusColor()}`}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          <div className='flex items-center gap-1'>
            {!isCollapsed && (
              <>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onModeChange('fullscreen')}
                  className='gap-1.5 px-2.5 text-xs'>
                  <Maximize2 size={10} />
                  Full
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onModeChange('floating')}
                  className='gap-1.5 px-2.5 text-xs'>
                  <PictureInPicture size={10} />
                  Float
                </Button>
              </>
            )}
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='h-8 w-8'>
              <X size={14} />
            </Button>
          </div>
        </div>

        {!isCollapsed && (
          <div className='flex h-[calc(100%-43px)] flex-col'>
            {renderContent()}
          </div>
        )}
      </div>,
      container,
    )
  }

  return (
    <div className='flex h-full flex-col'>
      <div className='bg-muted/30 border-border/50 sticky top-0 z-10 border-b p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => {
                setIsTerminalOpen(false)
                goBack()
              }}
              className='mr-1 h-8 w-8'>
              <ArrowLeft size={16} />
            </Button>
            <h2 className='text-sm font-semibold'>Console</h2>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onModeChange('embedded')}
              className='gap-1.5 text-xs'>
              <Terminal size={12} />
              Embedded
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onModeChange('fullscreen')}
              className='gap-1.5 text-xs'>
              <Maximize2 size={12} />
              Fullscreen
            </Button>
          </div>
        </div>
      </div>

      {renderContent()}
    </div>
  )
}

export default TerminalPanel
