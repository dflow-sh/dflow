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
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { Server, UpdatePreferenceFunction } from './bubble-types'

// Dynamically import the terminal components with ssr: false
const XTermTerminal = dynamic(() => import('@/components/XTermTerminal'), {
  ssr: false,
})

interface TerminalPanelProps {
  onBack: () => void
  servers: Server[]
  loadingServers: boolean
  errorServers: string | null
  refreshServers: () => void
  mode: 'floating' | 'embedded' | 'fullscreen'
  embeddedHeight: number
  onUpdatePreference: UpdatePreferenceFunction
  onClose: () => void
}

interface TerminalContentProps {
  serverId: string
  className?: string
}

const TerminalContent = ({ serverId, className }: TerminalContentProps) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'error'
  >('idle')
  const [logs, setLogs] = useState<string[]>([])
  const eventSourceRef = useRef<EventSource | null>(null)
  const connectionAttemptRef = useRef<number>(0)
  const isConnectingRef = useRef<boolean>(false)

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `${timestamp} - ${message}`])
  }, [])

  const cleanupConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    isConnectingRef.current = false
  }, [])

  const establishConnection = useCallback(() => {
    if (!serverId || isConnectingRef.current) {
      return
    }

    isConnectingRef.current = true
    connectionAttemptRef.current += 1
    const attempt = connectionAttemptRef.current

    cleanupConnection()

    setConnectionStatus('connecting')
    addLog(`Connection attempt ${attempt}: Connecting to server ${serverId}...`)

    try {
      const url = `/api/server-events?serverId=${serverId}&attempt=${attempt}&t=${Date.now()}`

      eventSourceRef.current = new EventSource(url)

      eventSourceRef.current.onopen = () => {
        setConnectionStatus('connected')
        addLog(`✓ Connection established to server ${serverId}`)
        addLog('Waiting for server logs...')
      }

      eventSourceRef.current.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) ?? {}
          if (data?.message) {
            addLog(data.message)
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error)
          addLog(`Error parsing message: ${event.data}`)
        }
      }

      eventSourceRef.current.onerror = error => {
        console.error('SSE Error:', error)

        if (connectionAttemptRef.current === attempt) {
          setConnectionStatus('error')
          addLog('✗ Connection failed')
        }

        cleanupConnection()
      }
    } catch (error) {
      console.error('Failed to create EventSource:', error)
      setConnectionStatus('error')
      addLog('✗ Failed to create connection to server')
      isConnectingRef.current = false
    }
  }, [serverId, addLog, cleanupConnection])

  useEffect(() => {
    if (serverId) {
      setConnectionStatus('idle')
      setLogs([])
      connectionAttemptRef.current = 0

      const timer = setTimeout(() => {
        establishConnection()
      }, 100)

      return () => {
        clearTimeout(timer)
        cleanupConnection()
      }
    }
  }, [serverId, establishConnection, cleanupConnection])

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'connecting':
        return 'text-blue-500'
      default:
        return 'text-slate-500'
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
      className={cn(
        'flex h-full w-full flex-col overflow-hidden bg-slate-950',
        className,
      )}>
      {/* Status Bar */}
      <div className='flex items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-2'>
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
        <div className='text-sm text-slate-400'>Server: {serverId}</div>
      </div>

      {/* Terminal Content */}
      <div className='flex-1 overflow-auto p-4 font-mono text-sm'>
        {connectionStatus === 'connecting' && (
          <div className='mb-4 flex items-center gap-2 text-blue-400'>
            <Loader2 size={16} className='animate-spin' />
            <span>Establishing connection to server events endpoint...</span>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className='mb-4 text-red-400'>
            <div className='mb-2 flex items-center gap-2'>
              <span>❌ Connection failed</span>
            </div>
          </div>
        )}

        {/* Logs Display */}
        <div className='space-y-1'>
          {logs.map((log, index) => (
            <div
              key={index}
              className={cn(
                'rounded px-2 py-0.5 leading-relaxed break-words transition-colors',
                log.includes('✓') && 'text-green-400',
                log.includes('✗') ||
                  log.includes('Error') ||
                  log.includes('Failed')
                  ? 'bg-red-950/20 text-red-400'
                  : log.includes('🔁') || log.includes('attempt')
                    ? 'bg-blue-950/20 text-blue-400'
                    : 'text-slate-200 hover:bg-slate-800/50',
                log.includes('INFO:') && 'text-blue-400',
                log.includes('WARN:') && 'text-yellow-400',
                log.includes('DEBUG:') && 'text-slate-400',
              )}>
              {log}
            </div>
          ))}
        </div>

        {/* Empty state messages */}
        {connectionStatus === 'connected' &&
          logs.filter(
            log =>
              !log.includes('Connecting') &&
              !log.includes('Successfully connected') &&
              !log.includes('Waiting for logs'),
          ).length === 0 && (
            <div className='py-8 text-center text-slate-500'>
              <div>✓ Connected to server events stream</div>
              <div className='mt-2 text-sm'>
                No server logs available yet. Logs will appear here when the
                server generates them.
              </div>
            </div>
          )}
      </div>

      {/* XTerm Terminal (hidden but kept for compatibility) */}
      <div style={{ display: 'none' }}>
        <XTermTerminal ref={terminalRef} />
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

const TerminalPanel = ({
  onBack,
  servers,
  loadingServers,
  errorServers,
  refreshServers,
  mode = 'floating',
  embeddedHeight = 300,
  onUpdatePreference,
  onClose,
}: TerminalPanelProps) => {
  const [activeServerId, setActiveServerId] = useState(servers[0]?.id || '')
  const [isResizing, setIsResizing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const resizeStartYRef = useRef<number>(0)
  const resizeStartHeightRef = useRef<number>(0)

  useEffect(() => {
    if (servers.length > 0 && !activeServerId) {
      setActiveServerId(servers[0].id)
    }
  }, [servers, activeServerId])

  const handleResizeStart = (e: React.MouseEvent) => {
    if (mode !== 'embedded') return

    e.preventDefault()
    setIsResizing(true)
    resizeStartYRef.current = e.clientY
    resizeStartHeightRef.current = embeddedHeight

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const deltaY = resizeStartYRef.current - e.clientY
      const newHeight = Math.max(
        200,
        Math.min(600, resizeStartHeightRef.current + deltaY),
      )

      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        onUpdatePreference('embeddedHeight', newHeight)
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'ns-resize'
  }

  const toggleFullscreen = () => {
    if (mode === 'fullscreen') {
      onUpdatePreference('terminalMode', 'floating')
      onClose()
    } else {
      onUpdatePreference('terminalMode', 'fullscreen')
    }
  }

  const toggleEmbedded = () => {
    if (mode === 'embedded') {
      onUpdatePreference('terminalMode', 'floating')
      onClose()
    } else {
      onUpdatePreference('terminalMode', 'embedded')
    }
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Render different layouts based on mode
  if (mode === 'fullscreen') {
    return (
      <div className='fixed inset-0 z-[100] flex flex-col bg-slate-950'>
        {/* Fullscreen Header */}
        <div className='flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-4'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => {
                onUpdatePreference('terminalMode', 'floating')
                onClose()
              }}
              className='h-8 w-8'>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h2 className='text-foreground text-xl font-semibold'>
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

        {/* Server Tabs */}
        <div className='border-b border-slate-700 bg-slate-800/50 px-6 py-3'>
          <ServerTabs
            servers={servers}
            activeServerId={activeServerId}
            onServerChange={setActiveServerId}
          />
        </div>

        {/* Terminal Content */}
        <div className='flex-1 overflow-hidden'>
          <TerminalContent serverId={activeServerId} className='h-full' />
        </div>
      </div>
    )
  }

  if (mode === 'embedded') {
    return (
      <div
        className={cn(
          'bg-background fixed right-0 bottom-0 left-0 z-[90] border-t shadow-2xl transition-all duration-300',
          isCollapsed ? 'h-12' : 'h-[300px]',
        )}
        style={{
          height: isCollapsed ? '48px' : `${embeddedHeight}px`,
          transition: isResizing ? 'none' : 'height 150ms ease-out',
        }}>
        {/* Resize Handle */}
        {!isCollapsed && (
          <div
            className={cn(
              'hover:bg-primary/40 absolute top-0 right-0 left-0 h-2 cursor-ns-resize transition-colors',
              isResizing ? 'bg-primary/60' : 'bg-border',
            )}
            onMouseDown={handleResizeStart}
          />
        )}

        {/* Embedded Header */}
        <div className='bg-muted/50 flex items-center justify-between border-b px-4 py-2'>
          <div className='flex items-center gap-3'>
            <button
              onClick={toggleCollapse}
              className='hover:bg-muted flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium transition-colors'>
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
                  className='h-8 gap-1 text-xs'>
                  <Maximize2 size={14} />
                  Fullscreen
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    onUpdatePreference('terminalMode', 'floating')
                    onClose()
                  }}
                  className='h-8 gap-1 text-xs'>
                  <PictureInPicture size={14} />
                  Floating
                </Button>
              </>
            )}
            <Button
              variant='ghost'
              size='icon'
              onClick={() => {
                onUpdatePreference('terminalMode', 'floating')
                onClose()
              }}
              className='h-8 w-8'>
              <X size={14} />
            </Button>
          </div>
        </div>

        {/* Terminal Content */}
        {!isCollapsed && (
          <div className='flex h-[calc(100%-48px)] flex-col'>
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
        )}
      </div>
    )
  }

  // Floating mode (default)
  if (loadingServers) {
    return (
      <div className='flex h-full flex-col'>
        <div className='border-border/50 border-b p-4'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={onBack}
              className='mr-3 h-8 w-8'>
              <ArrowLeft size={14} />
            </Button>
            <div>
              <h2 className='text-foreground text-lg font-semibold'>
                Server Terminal
              </h2>
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
        <div className='border-border/50 border-b p-4'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={onBack}
              className='mr-3 h-8 w-8'>
              <ArrowLeft size={14} />
            </Button>
            <div>
              <h2 className='text-foreground text-lg font-semibold'>
                Server Terminal
              </h2>
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
        <div className='border-border/50 border-b p-4'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={onBack}
              className='mr-3 h-8 w-8'>
              <ArrowLeft size={14} />
            </Button>
            <div>
              <h2 className='text-foreground text-lg font-semibold'>
                Server Terminal
              </h2>
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
      <div className='border-border/50 border-b p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={onBack}
              className='mr-3 h-8 w-8'>
              <ArrowLeft size={14} />
            </Button>
            <div>
              <h2 className='text-foreground text-lg font-semibold'>
                Server Terminal
              </h2>
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
              className='h-8 gap-1 text-xs'>
              <PictureInPicture size={14} />
              Embed
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={toggleFullscreen}
              className='h-8 gap-1 text-xs'>
              <Maximize2 size={14} />
              Fullscreen
            </Button>
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-hidden'>
        <div className='flex h-full flex-col'>
          <div className='border-border bg-muted/10 border-b px-4 py-2'>
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
