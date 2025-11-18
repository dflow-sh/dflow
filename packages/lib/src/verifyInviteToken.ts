'use server'

import { env } from '@dflow/config/env'
import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken'

const secret = env.PAYLOAD_SECRET

export async function verifyInviteToken(
  token: string,
): Promise<{ tenantId: string; role: string } | 'expired' | null> {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload

    if (!decoded.tenantId || !decoded.role) {
      return null
    }

    return {
      tenantId: decoded.tenantId,
      role: decoded.role,
    }
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      console.warn('Token expired')
      return 'expired'
    }

    return null
  }
}
