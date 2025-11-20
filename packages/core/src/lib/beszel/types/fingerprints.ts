import { BaseRecord } from './base'

// Fingerprints collection return type
export interface Fingerprint extends BaseRecord {
  system: string
  token?: string
  fingerprint?: string
}

// Create fingerprint input data type
export interface CreateFingerprintData {
  system: string
  token?: string
  fingerprint?: string
}

// Update fingerprint input data type
export interface UpdateFingerprintData {
  system?: string
  token?: string
  fingerprint?: string
}
