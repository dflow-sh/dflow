'use server'

import { env } from 'env'
import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken'

const secret = env.PAYLOAD_SECRET

export async function verifyInviteToken(
  token: string,
): Promise<{ tenantId: string; roles: string[] } | 'expired' | null> {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload

    if (!decoded.tenantId || !decoded.roles) {
      return null
    }

    return {
      tenantId: decoded.tenantId,
      roles: decoded.roles,
    }
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      console.warn('Token expired')
      return 'expired'
    }

    return null
  }
}
