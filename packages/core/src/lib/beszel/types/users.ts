import { BaseRecord } from './base'

// Users collection return type
export interface User extends BaseRecord {
  email: string
  emailVisibility: boolean
  verified: boolean
  username: string
  role: string
  name: string
  avatar: string
}

// Create user input data type
export interface CreateUserData {
  email: string
  password: string
  passwordConfirm: string
  emailVisibility?: boolean
  verified?: boolean
  id?: string
  username?: string
  role?: string
  name?: string
  avatar?: File | null | string | File[]
}

// Update user input data type
export interface UpdateUserData {
  email?: string
  emailVisibility?: boolean
  oldPassword?: string
  password?: string
  passwordConfirm?: string
  verified?: boolean
  username?: string
  role?: string
  name?: string
  avatar?: File | null | string | File[]
}
