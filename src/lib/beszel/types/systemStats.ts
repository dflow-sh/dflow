import { BaseRecord } from './base'

// System Stats collection return type
export interface SystemStats extends BaseRecord {
  system: string // RELATION_RECORD_ID
  cpu: number
  memory: number
  disk: number
  network_in: number
  network_out: number
  timestamp: string
}

// Create system stats input data type
export interface CreateSystemStatsData {
  system: string
  cpu: number
  memory: number
  disk: number
  network_in: number
  network_out: number
  timestamp: string
}

// Update system stats input data type
export interface UpdateSystemStatsData {
  system?: string
  cpu?: number
  memory?: number
  disk?: number
  network_in?: number
  network_out?: number
  timestamp?: string
}
