'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { dokku } from '@/lib/dokku'
import { protectedClient } from '@/lib/safe-action'
import { dynamicSSH } from '@/lib/ssh'

import {
  createServerSchema,
  deleteServiceSchema,
  installDokkuSchema,
} from './validator'

const payload = await getPayload({ config: configPromise })

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createServerAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createServerAction',
  })
  .schema(createServerSchema)
  .action(async ({ clientInput }) => {
    const { name, description, type, ip, port, username, sshKey } = clientInput

    const response = await payload.create({
      collection: 'servers',
      data: {
        name,
        description,
        type,
        ip,
        port,
        username,
        sshKey,
      },
    })

    if (response) {
      revalidatePath('/settings/servers')
    }

    return response
  })

export const deleteServerAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'deleteServerAction',
  })
  .schema(deleteServiceSchema)
  .action(async ({ clientInput }) => {
    const { id } = clientInput

    const response = await payload.delete({
      collection: 'servers',
      id,
    })

    if (response) {
      revalidatePath('/settings/servers')
      return { deleted: true }
    }
  })

export const installDokkuAction = protectedClient
  .metadata({
    actionName: 'installDokkuAction',
  })
  .schema(installDokkuSchema)
  .action(async ({ clientInput }) => {
    const { host, port, privateKey, username } = clientInput

    const ssh = await dynamicSSH({
      host,
      port,
      privateKey,
      username,
    })

    const installationResponse = await dokku.version.install(ssh)

    if (installationResponse.success) {
      revalidatePath('/settings/servers')
    }
  })
