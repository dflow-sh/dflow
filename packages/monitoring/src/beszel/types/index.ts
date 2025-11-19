// Type mapping for collections
import { Alert, CreateAlertData, UpdateAlertData } from './alerts'
import { Collections } from './base'
import {
  CreateFingerprintData,
  Fingerprint,
  UpdateFingerprintData,
} from './fingerprints'
import {
  CreateSystemStatsData,
  SystemStats,
  UpdateSystemStatsData,
} from './systemStats'
import { CreateSystemData, System, UpdateSystemData } from './systems'
import { CreateUserData, UpdateUserData, User } from './users'

// Export all base types
export * from './base'

// Export collection-specific types
export * from './alerts'
export * from './fingerprints'
export * from './systemStats'
export * from './systems'
export * from './users'

export type CollectionRecord<T extends Collections> =
  T extends Collections.USERS
    ? User
    : T extends Collections.ALERTS
      ? Alert
      : T extends Collections.SYSTEM_STATS
        ? SystemStats
        : T extends Collections.FINGERPRINTS
          ? Fingerprint
          : T extends Collections.SYSTEMS
            ? System
            : never

export type CollectionCreateData<T extends Collections> =
  T extends Collections.USERS
    ? CreateUserData
    : T extends Collections.ALERTS
      ? CreateAlertData
      : T extends Collections.SYSTEM_STATS
        ? CreateSystemStatsData
        : T extends Collections.FINGERPRINTS
          ? CreateFingerprintData
          : T extends Collections.SYSTEMS
            ? CreateSystemData
            : never

export type CollectionUpdateData<T extends Collections> =
  T extends Collections.USERS
    ? UpdateUserData
    : T extends Collections.ALERTS
      ? UpdateAlertData
      : T extends Collections.SYSTEM_STATS
        ? UpdateSystemStatsData
        : T extends Collections.FINGERPRINTS
          ? UpdateFingerprintData
          : T extends Collections.SYSTEMS
            ? UpdateSystemData
            : never
