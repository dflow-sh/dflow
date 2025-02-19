import { CollectionAfterReadHook } from 'payload'

import { dokku } from '@/lib/dokku'
import { dynamicSSH } from '@/lib/ssh'
import { Server } from '@/payload-types'

export const populateDokkuVersion: CollectionAfterReadHook<Server> = async ({
  doc,
}) => {
  const sshKey = typeof doc.sshKey === 'object' ? doc.sshKey : undefined
  let version: string | undefined

  if (sshKey && sshKey?.privateKey) {
    const ssh = await dynamicSSH({
      host: doc.ip,
      port: doc.port,
      privateKey: sshKey.privateKey,
      username: doc.username,
    })

    version = await dokku.version.info(ssh)
  }

  return {
    ...doc,
    version,
  }
}
