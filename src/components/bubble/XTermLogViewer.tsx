'use client'

import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef } from 'react'

interface XTermLogViewerProps {
  serverId: string
  onConnectionStatusChange?: (
    status: 'idle' | 'connecting' | 'connected' | 'error',
  ) => void
  onLogReceived?: (message: string) => void
  className?: string
}

// Light theme colors - optimized foreground for white background
const lightTheme = {
  background: '#ffffff',
  foreground: '#1f2937',
  selection: '#3b82f6',
  selectionForeground: '#ffffff',
  cursor: '#1f2937',
  cursorAccent: '#ffffff',
  black: '#374151',
  red: '#dc2626',
  green: '#059669',
  yellow: '#d97706',
  blue: '#2563eb',
  magenta: '#9333ea',
  cyan: '#0891b2',
  white: '#6b7280',
  brightBlack: '#9ca3af',
  brightRed: '#ef4444',
  brightGreen: '#10b981',
  brightYellow: '#f59e0b',
  brightBlue: '#3b82f6',
  brightMagenta: '#a855f7',
  brightCyan: '#06b6d4',
  brightWhite: '#111827',
}

// Dark theme colors - optimized foreground for #334256 background
const darkTheme = {
  background: '#334256',
  foreground: '#f1f5f9',
  selection: '#475569',
  selectionForeground: '#ffffff',
  cursor: '#f1f5f9',
  cursorAccent: '#334256',
  black: '#1e293b',
  red: '#f87171',
  green: '#4ade80',
  yellow: '#fbbf24',
  blue: '#60a5fa',
  magenta: '#c084fc',
  cyan: '#22d3ee',
  white: '#cbd5e1',
  brightBlack: '#64748b',
  brightRed: '#fca5a5',
  brightGreen: '#86efac',
  brightYellow: '#fcd34d',
  brightBlue: '#93c5fd',
  brightMagenta: '#d8b4fe',
  brightCyan: '#67e8f9',
  brightWhite: '#f8fafc',
}

export default function XTermLogViewer({
  serverId,
  onConnectionStatusChange,
  onLogReceived,
  className,
}: XTermLogViewerProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstanceRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const webLinksAddonRef = useRef<WebLinksAddon | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const connectionAttemptRef = useRef<number>(0)
  const isConnectingRef = useRef<boolean>(false)
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === 'system' ? systemTheme : theme

  // Get the appropriate theme colors
  const getThemeColors = () => {
    return currentTheme === 'dark' ? darkTheme : lightTheme
  }

  // Create terminal theme configuration
  const getTerminalTheme = (colors: typeof lightTheme) => ({
    background: colors.background,
    foreground: colors.foreground,
    cursor: colors.foreground,
    cursorAccent: colors.background,
    selectionBackground: colors.selection,
    selectionForeground: colors.selectionForeground,
    selectionInactiveBackground: colors.selection,

    black: colors.black,
    red: colors.red,
    green: colors.green,
    yellow: colors.yellow,
    blue: colors.blue,
    magenta: colors.magenta,
    cyan: colors.cyan,
    white: colors.white,
    brightBlack: colors.brightBlack,
    brightRed: colors.brightRed,
    brightGreen: colors.brightGreen,
    brightYellow: colors.brightYellow,
    brightBlue: colors.brightBlue,
    brightMagenta: colors.brightMagenta,
    brightCyan: colors.brightCyan,
    brightWhite: colors.brightWhite,
  })

  // Initialize xterm terminal
  const initializeTerminal = useCallback(() => {
    if (!terminalRef.current) return

    // Clean up existing terminal
    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.dispose()
    }

    const colors = getThemeColors()

    // Create new terminal instance
    const terminal = new Terminal({
      theme: getTerminalTheme(colors),
      fontSize: 14,
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      cursorBlink: false,
      disableStdin: true,
      scrollback: 10000,
      allowTransparency: false,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    terminal.loadAddon(fitAddon)
    terminal.loadAddon(webLinksAddon)

    terminal.open(terminalRef.current)

    // Fit the terminal after a short delay to ensure DOM is ready
    setTimeout(() => {
      fitAddon.fit()
    }, 100)

    terminalInstanceRef.current = terminal
    fitAddonRef.current = fitAddon
    webLinksAddonRef.current = webLinksAddon

    // Add welcome message with better contrast
    terminal.writeln('\x1b[96m=== Server Logs Terminal ===\x1b[0m') // Bright cyan
    terminal.writeln('\x1b[2mReady to display server logs...\x1b[0m') // Dim
    terminal.writeln('')

    return () => {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose()
      }
    }
  }, [currentTheme])

  // Write log to terminal with better color contrast
  const writeLog = useCallback(
    (message: string) => {
      if (!terminalInstanceRef.current) return

      const timestamp = new Date().toLocaleTimeString()
      let styledMessage = `\r\n\x1b[2m${timestamp}\x1b[0m `

      // Use bright ANSI colors for better contrast
      if (
        message.includes('✓') ||
        message.includes('Connected') ||
        message.includes('established') ||
        message.includes('successfully')
      ) {
        styledMessage += `\x1b[92m${message}\x1b[0m` // Bright green
      } else if (
        message.includes('✗') ||
        message.includes('Error') ||
        message.includes('Failed') ||
        message.includes('error')
      ) {
        styledMessage += `\x1b[91m${message}\x1b[0m` // Bright red
      } else if (
        message.includes('INFO:') ||
        message.toLowerCase().includes('info')
      ) {
        styledMessage += `\x1b[94m${message}\x1b[0m` // Bright blue
      } else if (
        message.includes('WARN:') ||
        message.toLowerCase().includes('warning')
      ) {
        styledMessage += `\x1b[93m${message}\x1b[0m` // Bright yellow
      } else if (
        message.includes('DEBUG:') ||
        message.toLowerCase().includes('debug')
      ) {
        styledMessage += `\x1b[2m${message}\x1b[0m` // Dim
      } else if (
        message.includes('attempt') ||
        message.includes('Connecting') ||
        message.includes('Starting')
      ) {
        styledMessage += `\x1b[96m${message}\x1b[0m` // Bright cyan
      } else {
        styledMessage += `${message}` // Default foreground
      }

      terminalInstanceRef.current.write(styledMessage)
      onLogReceived?.(message)
    },
    [onLogReceived],
  )

  const cleanupConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    isConnectingRef.current = false
  }, [])

  const establishConnection = useCallback(() => {
    if (!serverId || isConnectingRef.current) return

    isConnectingRef.current = true
    connectionAttemptRef.current += 1
    const attempt = connectionAttemptRef.current

    cleanupConnection()
    onConnectionStatusChange?.('connecting')

    writeLog(
      `Connection attempt ${attempt}: Connecting to server ${serverId}...`,
    )

    try {
      const url = `/api/server-events?serverId=${serverId}&attempt=${attempt}&t=${Date.now()}`
      eventSourceRef.current = new EventSource(url)

      eventSourceRef.current.onopen = () => {
        onConnectionStatusChange?.('connected')
        writeLog(`✓ Connection established to server ${serverId}`)
        writeLog('Waiting for server logs...')
      }

      eventSourceRef.current.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) ?? {}
          if (data?.message) {
            writeLog(data.message)
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error)
          writeLog(`Error parsing message: ${event.data}`)
        }
      }

      eventSourceRef.current.onerror = error => {
        console.error('SSE Error:', error)
        if (connectionAttemptRef.current === attempt) {
          onConnectionStatusChange?.('error')
          writeLog('✗ Connection failed')
        }
        cleanupConnection()
      }
    } catch (error) {
      console.error('Failed to create EventSource:', error)
      onConnectionStatusChange?.('error')
      writeLog('✗ Failed to create connection to server')
      isConnectingRef.current = false
    }
  }, [serverId, writeLog, cleanupConnection, onConnectionStatusChange])

  // Initialize terminal on mount
  useEffect(() => {
    initializeTerminal()
  }, [initializeTerminal])

  // Handle server changes
  useEffect(() => {
    if (serverId && terminalInstanceRef.current) {
      terminalInstanceRef.current.clear()
      connectionAttemptRef.current = 0

      terminalInstanceRef.current.writeln(
        `\x1b[96m=== Connected to Server: ${serverId} ===\x1b[0m`,
      )
      terminalInstanceRef.current.writeln('')

      const timer = setTimeout(() => {
        establishConnection()
      }, 100)

      return () => {
        clearTimeout(timer)
        cleanupConnection()
      }
    }
  }, [serverId, establishConnection, cleanupConnection])

  // Fit terminal on resize
  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current) {
        setTimeout(() => {
          fitAddonRef.current?.fit()
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle container resize with ResizeObserver
  useEffect(() => {
    if (!terminalRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current) {
        setTimeout(() => {
          fitAddonRef.current?.fit()
        }, 100)
      }
    })

    resizeObserver.observe(terminalRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const colors = getThemeColors()

  return (
    <div
      ref={terminalRef}
      className={className}
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: colors.background,
        color: colors.foreground,
      }}
    />
  )
}
