import type { Config, Plugin } from 'payload'

import { createWebhooksCollection } from "@core/plugins/webhook/collections/Webhooks"
import { webhookAfterChange } from "@core/plugins/webhook/hooks/afterChange"
import { webhookAfterDelete } from "@core/plugins/webhook/hooks/afterDelete"
import { webhookGlobalAfterChange } from "@core/plugins/webhook/hooks/globalAfterChange"

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
