import { BaseRecord } from './base'

// Fingerprints collection return type
export interface Fingerprint extends BaseRecord {
  system: string // RELATION_RECORD_ID
  data: string
  hash: string
}

// Create fingerprint input data type
export interface CreateFingerprintData {
  system: string
  data: string
  hash: string
}

// Update fingerprint input data type
export interface UpdateFingerprintData {
  system?: string
  data?: string
  hash?: string
}
