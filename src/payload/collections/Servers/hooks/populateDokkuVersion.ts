import isPortReachable from 'is-port-reachable'
import { CollectionAfterReadHook } from 'payload'

import { supportedLinuxVersions } from '@/lib/constants'
import { dokku } from '@/lib/dokku'
import { dynamicSSH } from '@/lib/ssh'
import { Server } from '@/payload-types'

const extractValue = ({ key, data }: { key: string; data: string }) => {
  const match = data.match(new RegExp(`${key}:\\t(.+)`))
  return match ? match[1] : null
}

export const populateDokkuVersion: CollectionAfterReadHook<Server> = async ({
  doc,
}) => {
  const sshKey = typeof doc.sshKey === 'object' ? doc.sshKey : undefined
  const portIsOpen = await isPortReachable(doc.port, { host: doc.ip })

  let version: string | undefined
  let sshConnected = true
  let linuxDistributionVersion
  let linuxDistributionType

  if (sshKey && sshKey?.privateKey) {
    if (portIsOpen) {
      try {
        const ssh = await dynamicSSH({
          host: doc.ip,
          port: doc.port,
          privateKey: sshKey.privateKey,
          username: doc.username,
        })

        const distroResponse = await dokku.distro.info(ssh)

        linuxDistributionVersion = extractValue({
          key: 'Release',
          data: distroResponse,
        })

        linuxDistributionType = extractValue({
          key: 'Distributor ID',
          data: distroResponse,
        })

        if (
          linuxDistributionVersion &&
          supportedLinuxVersions.includes(linuxDistributionVersion)
        ) {
          version = await dokku.version.info(ssh)
        }

        ssh.dispose()
      } catch (error) {
        console.log({ error })
        sshConnected = false
      }
    } else {
      sshConnected = false
    }
  }

  return {
    ...doc,
    version: version ?? null, // version of dokku
    portIsOpen, // boolean indicating whether the server is running
    sshConnected, // boolean indicating whether ssh is connected
    os: {
      type: linuxDistributionType ?? null,
      version: linuxDistributionVersion ?? null,
    },
  }
}
