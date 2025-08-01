import { BaseRecord } from './base'

// Systems collection return type
export interface System extends BaseRecord {
  name: string
  host: string
  port: number
  status: 'online' | 'offline' | 'warning'
  last_seen: string
}

// Create system input data type
export interface CreateSystemData {
  id?: string
  name: string
  status?: 'up' | 'down' | 'paused' | 'pending'
  host: string
  port?: string
  info?: String
  users: Array<String>
}

// Update system input data type
export interface UpdateSystemData {
  name?: string
  host?: string
  port?: number
  status?: 'online' | 'offline' | 'warning'
  last_seen?: string
}
