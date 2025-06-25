import isPortReachable from 'is-port-reachable'
import { CollectionAfterReadHook } from 'payload'

import { server } from '@/lib/server'
import { dynamicSSH, extractSSHDetails } from '@/lib/ssh'
import { Server } from '@/payload-types'

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

  let portIsOpen: boolean = false

  if (doc.hostname) {
    portIsOpen = true
  } else {
    portIsOpen = await isPortReachable(doc.port, { host: doc.ip })
  }

  let dokku: string | undefined
  let netdata: string | undefined
  let sshConnected = false
  let linuxVersion
  let linuxType
  let railpack: string | undefined

  const sshDetails = extractSSHDetails({
    server: doc,
  })

  console.dir({ sshDetails }, { depth: null })

  if (portIsOpen) {
    try {
      const ssh = await dynamicSSH(sshDetails)

      if (await ssh.isConnectedViaTailnet()) {
        console.log('populate dokku', 'connected with one of tailscale method')
        sshConnected = true
      } else if (ssh.isConnected()) {
        console.log('populate dokku', 'connected via pure node-ssh')
        sshConnected = true
      }

      const {
        dokkuVersion,
        linuxDistributionType,
        linuxDistributionVersion,
        netdataVersion,
        railpackVersion,
      } = await server.info({ ssh })

      dokku = dokkuVersion
      netdata = netdataVersion
      linuxVersion = linuxDistributionVersion
      linuxType = linuxDistributionType
      railpack = railpackVersion

      ssh.dispose()
    } catch (error) {
      console.log({ error })
      if (sshKey && sshKey?.privateKey) {
        console.log('no ssh keys')
      }
    }
  }

  try {
    await payload.update({
      collection: 'servers',
      id: doc.id,
      data: {
        connection: {
          status: sshConnected ? 'success' : 'failed',
          lastChecked: new Date().toString(),
        },
      },
    })
  } catch (error) {
    console.log({ error })
  }

  return {
    ...doc,
    version: dokku, // version of dokku
    netdataVersion: netdata,
    portIsOpen, // boolean indicating whether the server is running
    sshConnected, // boolean indicating whether ssh is connected
    os: {
      type: linuxType,
      version: linuxVersion,
    },
    railpack,
  }
}
