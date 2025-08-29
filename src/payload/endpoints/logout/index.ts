import type { PayloadHandler } from 'payload'

export const logoutHandler: PayloadHandler = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie':
        'payload-token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax',
      Location: '/sign-in',
    },
  })
}
