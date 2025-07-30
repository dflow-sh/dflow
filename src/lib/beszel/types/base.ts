// Base PocketBase record interface
export interface BaseRecord {
  id: string
  created: string
  updated: string
  collectionId: string
  collectionName: string
}

// Generic PocketBase list response
export interface PocketBaseListResult<T> {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: T[]
}

// Collection names enum for type safety
export enum Collections {
  USERS = 'users',
  ALERTS = 'alerts',
  SYSTEM_STATS = 'system_stats',
  FINGERPRINTS = 'fingerprints',
  SYSTEMS = 'systems',
}
