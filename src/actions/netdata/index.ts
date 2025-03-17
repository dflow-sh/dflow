'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { netdata } from '@/lib/netdata'
import { protectedClient } from '@/lib/safe-action'
import { dynamicSSH } from '@/lib/ssh'

import { uninstallNetdataSchema } from './validator'

const payload = await getPayload({ config: configPromise })

export const uninstallNetdataAction = protectedClient
  .metadata({
    actionName: 'uninstallNetdataAction',
  })
  .schema(uninstallNetdataSchema)
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

    // Establish SSH connection
    const ssh = await dynamicSSH(sshDetails)

    // Run the uninstall operation
    const uninstallResult = await netdata.core.uninstall({ ssh })

    console.log({ uninstallResult })

    // Clean up SSH connection
    ssh.dispose()

    // Refresh the server details page
    revalidatePath(`/settings/servers/${serverId}?tab=monitoring`)

    return {
      success: true,
      message: uninstallResult.message,
      details: uninstallResult,
    }
  })
