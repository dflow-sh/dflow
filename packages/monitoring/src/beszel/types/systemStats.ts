import { BaseRecord } from './base'

// System Stats collection return type
export interface SystemStats extends BaseRecord {
  system: string
  stats: Record<string, any>
  type: string
}

// Create system stats input data type
export interface CreateSystemStatsData {
  id?: string
  system: string
  stats: string
  type: string
}

// Update system stats input data type
export interface UpdateSystemStatsData {
  system: string
  stats: string
  type: string
}
