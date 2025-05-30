'use server'

import { env } from 'env'
import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET!

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
  console.log('function called')
  const token = jwt.sign({ tenantId, roles }, 'testing', {
    expiresIn: '1d',
  })
  console.log('token', token)
  const inviteLink = `${env.NEXT_PUBLIC_WEBSITE_URL}/invite?token=${token}`
  return inviteLink
}
