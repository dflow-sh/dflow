'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { publicClient } from '@/lib/safe-action'

export const getAuthConfigAction = publicClient
  .metadata({ actionName: 'fetchAuthConfigAction' })
  .action(async () => {
    const payload = await getPayload({ config: configPromise })

    try {
      const authConfig = await payload.findGlobal({
        slug: 'auth-config',
        depth: 0,
      })

      return {
        success: true,
        authConfig,
      }
    } catch (error) {
      // Return default config if global not found or error occurs
      return {
        success: true,
        authConfig: {
          authMethod: 'both',
        },
      }
    }
  })
