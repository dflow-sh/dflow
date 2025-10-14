import { create } from 'zustand'

interface LogEntry {
  timestamp: string
  message: string
  styled: string
}

interface ServerConnectionState {
  status: 'idle' | 'connecting' | 'connected' | 'error'
  logs: LogEntry[]
  lastConnected: number | null
}

interface TerminalState {
  // Currently active server ID
  activeServerId: string | null

  // Map of serverId to its connection state (in-memory only)
  servers: Record<string, ServerConnectionState>

  // Single active EventSource connection
  eventSource: EventSource | null

  // Connection flags for active server
  isConnecting: boolean
  connectionAttempt: number
}

interface TerminalActions {
  addLog: (serverId: string, message: string, styled: string) => void
  setStatus: (serverId: string, status: ServerConnectionState['status']) => void
  clearLogs: (serverId: string) => void
  switchToServer: (serverId: string) => void
  disconnectFromServer: () => void
  getServerState: (serverId: string) => ServerConnectionState
}

const DEFAULT_SERVER_STATE: ServerConnectionState = {
  status: 'idle',
  logs: [],
  lastConnected: null,
}

// Helper to style log messages
const styleLogMessage = (message: string): string => {
  const timestamp = new Date().toLocaleTimeString()
  let styledMessage = `\r\n\x1b[2m${timestamp}\x1b[0m `

  if (
    message.includes('✓') ||
    message.includes('Connected') ||
    message.includes('established') ||
    message.includes('successfully')
  ) {
    styledMessage += `\x1b[92m${message}\x1b[0m`
  } else if (
    message.includes('✗') ||
    message.includes('Error') ||
    message.includes('Failed') ||
    message.includes('error')
  ) {
    styledMessage += `\x1b[91m${message}\x1b[0m`
  } else if (
    message.includes('INFO:') ||
    message.toLowerCase().includes('info')
  ) {
    styledMessage += `\x1b[94m${message}\x1b[0m`
  } else if (
    message.includes('WARN:') ||
    message.toLowerCase().includes('warning')
  ) {
    styledMessage += `\x1b[93m${message}\x1b[0m`
  } else if (
    message.includes('DEBUG:') ||
    message.toLowerCase().includes('debug')
  ) {
    styledMessage += `\x1b[2m${message}\x1b[0m`
  } else if (
    message.includes('attempt') ||
    message.includes('Connecting') ||
    message.includes('Starting')
  ) {
    styledMessage += `\x1b[96m${message}\x1b[0m`
  } else {
    styledMessage += `${message}`
  }

  return styledMessage
}

export const useTerminalStore = create<TerminalState & TerminalActions>(
  (set, get) => ({
    // State
    activeServerId: null,
    servers: {},
    eventSource: null,
    isConnecting: false,
    connectionAttempt: 0,

    // Getters
    getServerState: (serverId: string) => {
      return get().servers[serverId] || DEFAULT_SERVER_STATE
    },

    // Actions
    setStatus: (serverId: string, status: ServerConnectionState['status']) => {
      set(state => ({
        servers: {
          ...state.servers,
          [serverId]: {
            ...(state.servers[serverId] || DEFAULT_SERVER_STATE),
            status,
            lastConnected:
              status === 'connected'
                ? Date.now()
                : state.servers[serverId]?.lastConnected || null,
          },
        },
      }))
    },

    addLog: (serverId: string, message: string, styled: string) => {
      const timestamp = new Date().toLocaleTimeString()

      set(state => {
        const serverState = state.servers[serverId] || DEFAULT_SERVER_STATE

        return {
          servers: {
            ...state.servers,
            [serverId]: {
              ...serverState,
              logs: [
                ...serverState.logs.slice(-999), // Keep last 1000 logs
                { timestamp, message, styled },
              ],
            },
          },
        }
      })
    },

    clearLogs: (serverId: string) => {
      set(state => ({
        servers: {
          ...state.servers,
          [serverId]: {
            ...(state.servers[serverId] || DEFAULT_SERVER_STATE),
            logs: [],
          },
        },
      }))
    },

    disconnectFromServer: () => {
      const state = get()

      // Close existing EventSource
      if (state.eventSource) {
        state.eventSource.close()
      }

      // Update status for active server
      if (state.activeServerId) {
        state.setStatus(state.activeServerId, 'idle')
      }

      set({
        eventSource: null,
        isConnecting: false,
        activeServerId: null,
      })
    },

    switchToServer: (serverId: string) => {
      const state = get()

      // If already on this server and connected, do nothing
      if (state.activeServerId === serverId && state.eventSource) {
        return
      }

      // Close existing connection to previous server
      if (state.eventSource) {
        state.eventSource.close()

        // Mark old server as idle
        if (state.activeServerId) {
          state.setStatus(state.activeServerId, 'idle')
        }
      }

      // Switch active server
      set({
        activeServerId: serverId,
        eventSource: null,
        isConnecting: false,
        connectionAttempt: 0,
      })

      // Prevent multiple simultaneous connection attempts
      if (state.isConnecting) {
        return
      }

      // Mark as connecting
      set({ isConnecting: true })

      // Increment attempt counter
      const attempt = get().connectionAttempt + 1
      set({ connectionAttempt: attempt })

      const styled = styleLogMessage(
        `Connection attempt ${attempt}: Connecting to server ${serverId}...`,
      )

      state.setStatus(serverId, 'connecting')
      state.addLog(
        serverId,
        `Connection attempt ${attempt}: Connecting to server ${serverId}...`,
        styled,
      )

      try {
        const url = `/api/server-events?serverId=${serverId}&attempt=${attempt}&t=${Date.now()}`
        const eventSource = new EventSource(url)

        eventSource.onopen = () => {
          const currentState = get()

          // Only update if this is still the active server
          if (currentState.activeServerId !== serverId) {
            eventSource.close()
            return
          }

          const openStyled = styleLogMessage(
            `✓ Connection established to server ${serverId}`,
          )
          const waitStyled = styleLogMessage('Waiting for server logs...')

          currentState.setStatus(serverId, 'connected')
          currentState.addLog(
            serverId,
            `✓ Connection established to server ${serverId}`,
            openStyled,
          )
          currentState.addLog(
            serverId,
            'Waiting for server logs...',
            waitStyled,
          )

          set({ isConnecting: false })
        }

        eventSource.onmessage = (event: MessageEvent) => {
          const currentState = get()

          // Only process messages for the active server
          if (currentState.activeServerId !== serverId) {
            return
          }

          try {
            const data = JSON.parse(event.data) ?? {}
            if (data?.message) {
              const styled = styleLogMessage(data.message)
              currentState.addLog(serverId, data.message, styled)
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error)
            const errorStyled = styleLogMessage(
              `Error parsing message: ${event.data}`,
            )
            currentState.addLog(
              serverId,
              `Error parsing message: ${event.data}`,
              errorStyled,
            )
          }
        }

        eventSource.onerror = error => {
          console.error('SSE Error:', error)
          const currentState = get()

          // Only handle errors for the active server
          if (currentState.activeServerId !== serverId) {
            eventSource.close()
            return
          }

          const errorStyled = styleLogMessage('✗ Connection failed')

          currentState.setStatus(serverId, 'error')
          currentState.addLog(serverId, '✗ Connection failed', errorStyled)

          set({
            eventSource: null,
            isConnecting: false,
          })

          eventSource.close()
        }

        set({ eventSource })
      } catch (error) {
        console.error('Failed to create EventSource:', error)
        const errorStyled = styleLogMessage(
          '✗ Failed to create connection to server',
        )

        state.setStatus(serverId, 'error')
        state.addLog(
          serverId,
          '✗ Failed to create connection to server',
          errorStyled,
        )

        set({ isConnecting: false })
      }
    },
  }),
)
