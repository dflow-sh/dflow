'use server'

import { env } from 'env'
import jwt from 'jsonwebtoken'

const secret = env.PAYLOAD_SECRET

/**
 * Generate a secure invitation link.
 *
 * @param tenantId - Tenant ID (team to join)
 * @param role - Role of the invited user (e.g., "tenant-user")

 * @returns A URL-safe invitation link with embedded JWT token
 */
export async function generateInviteLink(
  tenantId: string,
  roles: string[],
): Promise<string> {
  const token = jwt.sign({ tenantId, roles }, secret, {
    expiresIn: '1d',
  })
  console.log('token', token)
  const inviteLink = `${env.NEXT_PUBLIC_WEBSITE_URL}/invite?token=${token}`
  return inviteLink
}
