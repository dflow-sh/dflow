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

  try {
    // Skip processing if populateServerDetails flag is false
    if (!context.populateServerDetails) {
      return doc
    }

    const sshDetails = extractSSHDetails({ server: doc })

    // Extract connection parameters
    const isTailscale = doc.preferConnectionType === 'tailscale'
    const port = doc.port ?? 22
    const host = isTailscale ? (doc.hostname ?? '') : (doc.ip ?? '')

    // Return default values if no host is available
    if (!host) {
      return {
        ...doc,
        version: undefined,
        netdataVersion: undefined,
        portIsOpen: false,
        sshConnected: false,
        os: {
          type: undefined,
          version: undefined,
        },
        railpack: undefined,
        connection: {
          status: 'failed',
          lastChecked: new Date().toString(),
        },
      }
    }

    // Check if port is reachable
    const portIsOpen = await isPortReachable(port, { host })

    // Initialize server information variables
    let dokku: string | undefined | null
    let netdata: string | undefined | null
    let sshConnected = false
    let linuxVersion: string | undefined | null
    let linuxType: string | undefined | null
    let railpack: string | undefined | null

    // Attempt SSH connection if possible
    if (portIsOpen) {
      const ssh = await dynamicSSH(sshDetails)

      try {
        if (ssh.isConnected()) {
          sshConnected = true

          // Gather server information
          const serverInfo = await server.info({ ssh })

          dokku = serverInfo.dokkuVersion
          netdata = serverInfo.netdataVersion
          linuxVersion = serverInfo.linuxDistributionVersion
          linuxType = serverInfo.linuxDistributionType
          railpack = serverInfo.railpackVersion
        }

        ssh.dispose()
      } catch (error) {
        console.log(`Connection error for ${doc.name}:`, error)
        try {
          ssh.dispose()
        } catch (disposeError) {
          console.log('Error disposing SSH connection:', disposeError)
        }
      }
    }

    // Update connection status in database
    setImmediate(() => {
      payload
        .update({
          collection: 'servers',
          id: doc.id,
          data: {
            connection: {
              status: sshConnected ? 'success' : 'failed',
              lastChecked: new Date().toString(),
            },
          },
        })
        .catch(error => {
          console.log('Error updating server connection status:', error)
        })
    })

    // Return enriched server document
    return {
      ...doc,
      version: dokku,
      netdataVersion: netdata,
      portIsOpen,
      sshConnected,
      os: {
        type: linuxType,
        version: linuxVersion,
      },
      railpack,
      connection: {
        status: sshConnected ? 'success' : 'failed',
        lastChecked: new Date().toString(),
      },
    }
  } catch (error) {
    console.error('populateDokkuVersion error:', error)
    // Return document with failed connection status
    return {
      ...doc,
      version: undefined,
      netdataVersion: undefined,
      portIsOpen: false,
      sshConnected: false,
      os: {
        type: undefined,
        version: undefined,
      },
      railpack: undefined,
      connection: {
        status: 'failed',
        lastChecked: new Date().toString(),
      },
    }
  }
}
