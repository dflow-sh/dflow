import { cookies } from 'next/headers'

// getTenant will only give the tenant slug!
export async function getTenant({
  organisation,
}: { organisation?: string } = {}) {
  const cookieStore = await cookies()

  const slug = organisation
    ? organisation
    : cookieStore.get('organisation')?.value

  return slug ?? ''
}
