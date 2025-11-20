'use client'

import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef } from 'react'

import { useTerminalStore } from '@/stores/useTerminalStore'

interface XTermLogViewerProps {
  serverId: string
  onConnectionStatusChange?: (
    status: 'idle' | 'connecting' | 'connected' | 'error',
  ) => void
  className?: string
}

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

const darkTheme = {
  background: '#171d35',
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
  className,
}: XTermLogViewerProps) {
  const terminalRef = useRef<HTMLDivElement | null>(null)
  const terminalInstanceRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const lastRenderedLogCountRef = useRef(0)
  const previousServerIdRef = useRef<string | null>(null)

  const serverState = useTerminalStore(state => state.getServerState(serverId))
  const switchToServer = useTerminalStore(state => state.switchToServer)
  const activeServerId = useTerminalStore(state => state.activeServerId)

  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === 'system' ? systemTheme : theme

  const getThemeColors = () => {
    return currentTheme === 'dark' ? darkTheme : lightTheme
  }

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

  const initializeTerminal = useCallback(() => {
    if (!terminalRef.current) return

    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.dispose()
    }

    const colors = getThemeColors()

    const terminal = new Terminal({
      theme: getTerminalTheme(colors),
      fontSize: 14,
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      cursorBlink: false,
      disableStdin: true,
      scrollback: 10000,
      allowTransparency: false,
      convertEol: true,
      scrollOnUserInput: false,
      fastScrollModifier: 'shift',
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    terminal.loadAddon(fitAddon)
    terminal.loadAddon(webLinksAddon)
    terminal.open(terminalRef.current)

    terminalInstanceRef.current = terminal
    fitAddonRef.current = fitAddon
    lastRenderedLogCountRef.current = 0

    setTimeout(() => {
      fitAddon.fit()

      if (serverState.logs.length > 0) {
        serverState.logs.forEach(log => {
          terminal.write(log.styled)
        })
        lastRenderedLogCountRef.current = serverState.logs.length
      }
    }, 100)

    return () => {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose()
      }
    }
  }, [currentTheme, serverId])

  useEffect(() => {
    initializeTerminal()
  }, [initializeTerminal])

  useEffect(() => {
    if (serverId && serverId !== activeServerId) {
      switchToServer(serverId)
    }
  }, [serverId, activeServerId, switchToServer])

  useEffect(() => {
    if (!terminalInstanceRef.current) return

    const terminal = terminalInstanceRef.current
    const serverChanged = previousServerIdRef.current !== serverId

    if (serverChanged) {
      terminal.clear()
      lastRenderedLogCountRef.current = 0
      previousServerIdRef.current = serverId

      if (serverState.logs.length > 0) {
        serverState.logs.forEach(log => {
          terminal.write(log.styled)
        })
        lastRenderedLogCountRef.current = serverState.logs.length
      }
    } else {
      const newLogs = serverState.logs.slice(lastRenderedLogCountRef.current)
      newLogs.forEach(log => {
        terminal.write(log.styled)
      })
      lastRenderedLogCountRef.current = serverState.logs.length
    }
  }, [serverId, serverState.logs])

  useEffect(() => {
    onConnectionStatusChange?.(serverState.status)
  }, [serverState.status, onConnectionStatusChange])

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
        width: '100%',
        height: '100%',
        backgroundColor: colors.background,
        overflow: 'hidden',
        position: 'relative',
      }}
    />
  )
}
