import { BaseRecord } from './base'

// System Stats collection return type
export interface SystemStats extends BaseRecord {
  system: string
  stats: JSON
  type: string
}

// Create system stats input data type
export interface CreateSystemStatsData {
  id?: string
  system: string
  stats: JSON
  type: string
}

// Update system stats input data type
export interface UpdateSystemStatsData {
  system?: string
  stats?: JSON
  type?: string
}
