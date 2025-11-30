import type { Role } from '@/payload-types'

import { type ActionName, getActionAccess } from './config'

type DeepValue<T, K extends string> = K extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? DeepValue<T[Key], Rest>
    : never
  : K extends keyof T
    ? T[K]
    : never

function getNestedValue<T, K extends string>(
  obj: T,
  path: K,
): DeepValue<T, K> | undefined {
  return path
    .split('.')
    .reduce<any>((acc, key) => (acc && key in acc ? acc[key] : undefined), obj)
}

export function assertRolePermission<T extends ActionName>(
  role: Role,
  actionName: T,
): void {
  const requiredPermissions = getActionAccess[actionName]

  const denied: string[] = requiredPermissions.filter(path => {
    const value = getNestedValue(role, path)
    return value !== true
  })

  if (denied.length > 0) {
    throw new Error(
      `Access denied: Missing permission(s) for ${denied.join(', ')}`,
    )
  }
}
