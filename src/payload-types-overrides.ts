import { Server } from './payload-types'

export interface ServerType extends Server {
  version?: string | 'not-installed'
}
