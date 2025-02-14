'use server'

import { publicClient } from '@/lib/safe-action'

export const githubAppInstallationAction = publicClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'githubAppInstallationAction',
  })
  .action(async () => {
    await fetch('https://github.com/settings/apps/new?state=gh_init:12345', {
      method: 'POST',
      body: JSON.stringify({
        redirect_url:
          'https://app.dokploy.com/api/providers/github/setup?authId=wppRvML32U96yxQTL8Rcd',
        name: 'Dflow-2025-02-14',
        url: 'https://app.dokploy.com',
        hook_attributes: {
          url: 'https://app.dokploy.com/api/deploy/github',
        },
        callback_urls: ['https://app.dokploy.com/api/providers/github/setup'],
        public: false,
        request_oauth_on_install: true,
        default_permissions: {
          contents: 'read',
          metadata: 'read',
          emails: 'read',
          pull_requests: 'write',
        },
        default_events: ['pull_request', 'push'],
      }),
    })
  })
