import { AsyncLocalStorage } from 'async_hooks'

export interface UserContextData {
  userId?: string
  userEmail?: string
  userName?: string
}

// Create AsyncLocalStorage instance to store user information
export const userContextStorage = new AsyncLocalStorage<UserContextData>()

// Get current user context or empty object if not available
export const getUserContext = (): UserContextData => {
  return userContextStorage.getStore() || {}
}

// Run an operation with user context
export const withUserContext = async <T>(
  userData: UserContextData,
  fn: () => Promise<T>,
): Promise<T> => {
  return userContextStorage.run(userData, fn)
}
