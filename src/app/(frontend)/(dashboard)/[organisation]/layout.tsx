import { getTenant } from '@/lib/get-tenant'

export default async function ({ children }: { children: React.ReactNode }) {
  const { user, isInTenant, userTenant } = await getTenant()
  return <>{children}</>
}
