'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { protectedClient } from '@/lib/safe-action'
import { addInstallNetdataQueue } from '@/queues/netdata/install'
import { addUninstallNetdataQueue } from '@/queues/netdata/uninstall'

import { installNetdataSchema, uninstallNetdataSchema } from './validator'

const payload = await getPayload({ config: configPromise })

export const installNetdataAction = protectedClient
  .metadata({
    actionName: 'installNetdataAction',
  })
  .schema(installNetdataSchema)
  .action(async ({ clientInput }) => {
    const { serverId } = clientInput

    // Fetch server details from the database
    const { id, ip, username, port, sshKey } = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 5,
    })

    if (!id) {
      throw new Error('Server not found')
    }

    if (typeof sshKey !== 'object') {
      throw new Error('SSH key not found')
    }

    // Set up SSH connection details
    const sshDetails = {
      host: ip,
      port,
      username,
      privateKey: sshKey.privateKey,
    }

    // Add the job to the queue instead of executing directly
    await addInstallNetdataQueue({
      sshDetails,
      serverDetails: {
        id: serverId,
      },
    })

    // Refresh the server details page
    revalidatePath(`/settings/servers/${serverId}?tab=monitoring`)

    return {
      success: true,
      message:
        'Netdata installation started. You can monitor progress in the server logs.',
    }
  })

export const uninstallNetdataAction = protectedClient
  .metadata({
    actionName: 'uninstallNetdataAction',
  })
  .schema(uninstallNetdataSchema)
  .action(async ({ clientInput }) => {
    const { serverId } = clientInput
    const serverDetails = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 10,
    })

    if (typeof serverDetails.sshKey === 'object') {
      const uninstallResponse = await addUninstallNetdataQueue({
        serverDetails: {
          id: serverId,
        },
        sshDetails: {
          host: serverDetails.ip,
          port: serverDetails.port,
          privateKey: serverDetails.sshKey.privateKey,
          username: serverDetails.username,
        },
      })

      if (uninstallResponse.id) {
        return { success: true }
      }
    }
  })
