import isPortReachable from 'is-port-reachable'
import { CollectionAfterReadHook } from 'payload'

import { supportedLinuxVersions } from '@/lib/constants'
import { dokku } from '@/lib/dokku'
import { netdata } from '@/lib/netdata'
import { server } from '@/lib/server'
import { dynamicSSH } from '@/lib/ssh'
import { Server } from '@/payload-types'

const extractValue = ({ key, data }: { key: string; data: string }) => {
  const match = data.match(new RegExp(`${key}:\\t(.+)`))
  return match ? match[1] : null
}

export const populateDokkuVersion: CollectionAfterReadHook<Server> = async ({
  doc,
  context,
  req,
}) => {
  const { payload } = req

  // Sending a variable for populating server details
  if (!context.populateServerDetails) {
    return doc
  }

  const sshKey = typeof doc.sshKey === 'object' ? doc.sshKey : undefined
  const portIsOpen = await isPortReachable(doc.port, { host: doc.ip })

  let version: string | undefined
  let netdataVersion: string | null = null
  let sshConnected = false
  let linuxDistributionVersion
  let linuxDistributionType
  let railpack: string | undefined

  if (sshKey && sshKey?.privateKey) {
    if (portIsOpen) {
      try {
        const ssh = await dynamicSSH({
          host: doc.ip,
          port: doc.port,
          privateKey: sshKey.privateKey,
          username: doc.username,
        })

        if (ssh.isConnected()) {
          sshConnected = true

          try {
            await payload.update({
              collection: 'servers',
              id: doc.id,
              data: {
                connection: {
                  status: 'success',
                  lastChecked: new Date().toString(),
                },
              },
            })
          } catch (error) {
            console.log({ error })
          }
        }

        netdataVersion = await netdata.core.getVersion({ ssh })

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

        const railpackResponse = await server.railpack.info({ ssh })
        railpack = railpackResponse

        ssh.dispose()
      } catch (error) {
        console.log({ error })
      }
    }
  }

  return {
    ...doc,
    version: version ?? null, // version of dokku
    netdataVersion,
    portIsOpen, // boolean indicating whether the server is running
    sshConnected, // boolean indicating whether ssh is connected
    os: {
      type: linuxDistributionType ?? null,
      version: linuxDistributionVersion ?? null,
    },
    railpack,
  }
}
