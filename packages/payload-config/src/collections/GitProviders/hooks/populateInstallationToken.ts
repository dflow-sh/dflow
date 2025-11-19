import { createAppAuth } from '@octokit/auth-app'
import { CollectionAfterChangeHook } from 'payload'

import { GitProvider } from '@/payload-types'

// This hook is for population on installation token & expiry-time after app-installation
export const populateInstallationToken: CollectionAfterChangeHook<
  GitProvider
> = async ({ doc, req: { payload }, operation, previousDoc }) => {
  if (
    operation === 'update' &&
    doc.type === 'github' &&
    doc.github &&
    !previousDoc.github?.installationId &&
    doc.github?.installationId
  ) {
    const { appId, privateKey, clientId, clientSecret } = doc.github

    const auth = createAppAuth({
      appId: `${appId}`,
      privateKey,
      clientId,
      clientSecret,
    })

    const { token, expiresAt } = await auth({ type: 'app' })

    await payload.update({
      collection: 'gitProviders',
      id: doc.id,
      data: {
        github: {
          installationToken: token,
          tokenExpiration: expiresAt,
        },
      },
    })
  }
}
