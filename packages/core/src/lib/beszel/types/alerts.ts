import { BaseRecord } from './base'

// Alerts collection return type
export interface Alert extends BaseRecord {
  user: string // RELATION_RECORD_ID
  system: string // RELATION_RECORD_ID
  name: string
  value: number
  min: number
  triggered: boolean
}

// Create alert input data type
export interface CreateAlertData {
  user: string
  system: string
  name: string
  value: number
  min: number
  triggered: boolean
}

// Update alert input data type
export interface UpdateAlertData {
  user?: string
  system?: string
  name?: string
  value?: number
  min?: number
  triggered?: boolean
}
