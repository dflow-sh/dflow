import { env } from 'env'
import { PayloadHandler, PayloadRequest } from 'payload'

import { createSession } from '@/lib/createSession'

export const autoLogin: PayloadHandler = async (req: PayloadRequest) => {
  const { payload, routeParams } = req

  const receivedToken = routeParams?.token
  // TODO: Pavan, ensure this was properly configured with frequently changed token
  // The token has to be generate upon user click from dflow.sh (expiration time < 1 minute)
  // once used the token should be null

  const user = await payload.db.findOne<any>({
    collection: 'users',
    req,
    where: {
      id: {
        equals: '681dd95b18402af3dca75fd3', // TODO: replace with extracted userId
      },
    },
  })

  await createSession(user)

  return Response.redirect(
    new URL(`${user?.username}/dashboard`, env.NEXT_PUBLIC_WEBSITE_URL),
  )
}
