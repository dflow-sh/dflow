import type { PayloadHandler } from 'payload'

export const logoutHandler: PayloadHandler = async () => {
  return new Response('OK', {
    status: 200,
    headers: {
      'Set-Cookie':
        'payload-token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax',
      'X-Frame-Options': 'ALLOWALL',
    },
  })
}
