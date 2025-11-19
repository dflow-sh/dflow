import { BaseRecord } from './base'

// Systems collection return type
export interface System extends BaseRecord {
  name: string
  status?: 'up' | 'down' | 'paused' | 'pending'
  host: string
  port?: string
  info?: Record<string, any>
  users: Array<String>
}

// Create system input data type
export interface CreateSystemData {
  id?: string
  name: string
  status?: 'up' | 'down' | 'paused' | 'pending'
  host: string
  port?: string
  info?: string
  users: Array<String>
}

// Update system input data type
export interface UpdateSystemData {
  name: string
  status?: 'up' | 'down' | 'paused' | 'pending'
  host: string
  port?: string
  info?: string
  users: Array<String>
}
