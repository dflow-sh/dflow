export type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
export type Theme = 'light' | 'dark' | 'system'
export type Size = 'small' | 'medium' | 'large'
export type Panel =
  | 'menu'
  | 'preferences'
  | 'logs'
  | 'queues'
  | 'sync'
  | 'terminal'
export type TerminalMode = 'floating' | 'embedded' | 'fullscreen'
export type NotificationType =
  | 'sync'
  | 'queue'
  | 'log'
  | 'success'
  | 'error'
  | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  timestamp: number
  dismissed?: boolean
}

export interface Preferences {
  position: Position
  theme: Theme
  size: Size
  visible: boolean
  terminalMode: TerminalMode
  embeddedHeight: number
}

export interface Server {
  id: string
  name: string
  status?: string
}

export type UpdatePreferenceFunction = <K extends keyof Preferences>(
  key: K,
  value: Preferences[K],
) => void
export type GenericUpdatePreferenceFunction = (key: string, value: any) => void
