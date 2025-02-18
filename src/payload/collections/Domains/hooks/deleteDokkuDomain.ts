import { CollectionAfterDeleteHook } from 'payload'

import { dokku } from '@/lib/dokku'
import { pub } from '@/lib/redis'
import { dynamicSSH } from '@/lib/ssh'
import { Domain } from '@/payload-types'

export const deleteDokkuDomain: CollectionAfterDeleteHook<Domain> = async ({
  doc,
  req: { payload },
}) => {
  const {
    project,
    type,
    providerType,
    githubSettings,
    provider,
    ...serviceDetails
  } = await payload.findByID({
    collection: 'services',
    depth: 10,
    id: typeof doc.service === 'object' ? doc.service.id : doc.service,
  })

  if (
    typeof project === 'object' &&
    typeof project?.server === 'object' &&
    typeof project?.server?.sshKey === 'object'
  ) {
    const sshDetails = {
      privateKey: project?.server?.sshKey?.privateKey,
      host: project?.server?.ip,
      username: project?.server?.username,
      port: project?.server?.port,
    }

    console.dir({ doc }, { depth: Infinity })

    // For create operation trigging dokku deployment
    if (type === 'app') {
      if (providerType === 'github' && githubSettings) {
        // Connecting to ssh
        const ssh = await dynamicSSH(sshDetails)

        // Attaching the new-domain
        await dokku.domains.remove(ssh, serviceDetails.name, doc.hostName, {
          onStdout: async chunk => {
            await pub.publish('my-channel', chunk.toString())
            // console.info(chunk.toString());
          },
          onStderr: chunk => {
            console.info({
              createAppsLogs: {
                message: chunk.toString(),
                type: 'stdout',
              },
            })
          },
        })
      }
    }
  }
}
