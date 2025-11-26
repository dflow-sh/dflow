// Type mapping for collections
import { Alert, CreateAlertData, UpdateAlertData } from "@core/lib/beszel/types/alerts"
import { Collections } from "@core/lib/beszel/types/base"
import {
  CreateFingerprintData,
  Fingerprint,
  UpdateFingerprintData,
} from "@core/lib/beszel/types/fingerprints"
import {
  CreateSystemStatsData,
  SystemStats,
  UpdateSystemStatsData,
} from "@core/lib/beszel/types/systemStats"
import { CreateSystemData, System, UpdateSystemData } from "@core/lib/beszel/types/systems"
import { CreateUserData, UpdateUserData, User } from "@core/lib/beszel/types/users"

// Export all base types
export * from "@core/lib/beszel/types/base"

// Export collection-specific types
export * from "@core/lib/beszel/types/alerts"
export * from "@core/lib/beszel/types/fingerprints"
export * from "@core/lib/beszel/types/systemStats"
export * from "@core/lib/beszel/types/systems"
export * from "@core/lib/beszel/types/users"

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
