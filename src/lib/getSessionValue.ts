export function getSessionValue(key: string): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(key)
}
