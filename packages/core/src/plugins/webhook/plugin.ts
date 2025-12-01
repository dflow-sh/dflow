import type { Config, Plugin } from 'payload'

import { createWebhooksCollection } from './collections/Webhooks'
import { webhookAfterChange } from './hooks/afterChange'
import { webhookAfterDelete } from './hooks/afterDelete'
import { webhookGlobalAfterChange } from './hooks/globalAfterChange'

export const webhooksPlugin: Plugin = (config: Config): Config => {
  const webhooksCollection = createWebhooksCollection(config)

  return {
    ...config,
    collections: [...(config.collections || []), webhooksCollection].map(
      collection => {
        if (collection.slug === 'webhooks') {
          return collection
        }

        return {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: [
              ...(collection.hooks?.afterChange || []),
              webhookAfterChange,
            ],
            afterDelete: [
              ...(collection.hooks?.afterDelete || []),
              webhookAfterDelete,
            ],
          },
        }
      },
    ),
    globals: (config.globals || []).map(global => ({
      ...global,
      hooks: {
        ...global.hooks,
        afterChange: [
          ...(global.hooks?.afterChange || []),
          webhookGlobalAfterChange,
        ],
      },
    })),
  }
}
