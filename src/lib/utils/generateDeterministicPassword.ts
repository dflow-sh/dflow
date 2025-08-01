import crypto from 'crypto'

export const generateDeterministicPassword = (
  email: string,
  secret: string,
): string => {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(email)
  const hash = hmac.digest('hex')
  return hash
}
