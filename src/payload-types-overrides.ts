import { Server } from './payload-types'

export interface ServerType extends Server {
  version: string | 'not-installed' | null
  portIsOpen: boolean
  sshConnected: boolean
  os: {
    type: string | null
    version: string | null
  }
  railpack: string | undefined
}
