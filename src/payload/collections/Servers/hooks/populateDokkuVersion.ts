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
        publicIp: doc.publicIp ?? undefined,
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
    let shouldUpdateCloudInitStatus = false
    let shouldUpdatePublicIp = false
    let shouldUpdateTailscaleIp = false
    let newPublicIp: string | undefined = undefined
    let newTailscaleIp: string | undefined = undefined

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

          // If cloudInitStatus was running, check and update if needed
          if (doc.cloudInitStatus === 'running') {
            try {
              const { stdout: cloudInitStatusOut } =
                await ssh.execCommand('cloud-init status')

              console.log('cloudInitStatusOut:', cloudInitStatusOut)

              const statusMatch = cloudInitStatusOut.match(/status:\s*(\w+)/)
              const status = statusMatch ? statusMatch[1] : ''

              if (status !== 'running') {
                shouldUpdateCloudInitStatus = true
              }
            } catch (cloudInitError) {
              console.log('Error checking cloud-init status:', cloudInitError)
            }
          }

          if (!doc.publicIp || !doc.tailscalePrivateIp) {
            try {
              // Get public IP from external service
              const { stdout: publicIpOut } = await ssh.execCommand(
                'curl -4 ifconfig.me',
              )
              const publicIp = publicIpOut.trim()

              // Get all local IPs in JSON
              const { stdout: ipAddrOut } = await ssh.execCommand('ip -j addr')
              let ipJson: any[] = []
              try {
                ipJson = JSON.parse(ipAddrOut)
              } catch (jsonErr) {
                ipJson = []
              }

              // Extract Tailscale IP
              const tailscaleIp = ipJson
                .find((iface: any) => iface.ifname === 'tailscale0')
                ?.addr_info?.find((addr: any) => addr.family === 'inet')?.local

              console.log('tailscaleIp:', tailscaleIp)

              if (tailscaleIp) {
                newTailscaleIp = tailscaleIp
                shouldUpdateTailscaleIp = true
              }

              const allIps: string[] = []
              for (const iface of ipJson) {
                if (iface.addr_info) {
                  for (const addr of iface.addr_info) {
                    if (addr.local) allIps.push(addr.local)
                  }
                }
              }

              if (publicIp && allIps.includes(publicIp)) {
                newPublicIp = publicIp
              } else {
                newPublicIp = '999.999.999.999'
              }

              shouldUpdatePublicIp = true
            } catch (publicIpErr) {
              console.log('Error fetching public IP:', publicIpErr)
            }
          }
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

    const newConnectionStatus = sshConnected ? 'success' : 'failed'
    const connectionStatusChanged =
      doc.connection?.status !== newConnectionStatus

    if (
      connectionStatusChanged ||
      shouldUpdateCloudInitStatus ||
      shouldUpdatePublicIp ||
      shouldUpdateTailscaleIp
    ) {
      const updateData: Partial<Server> = {}

      if (connectionStatusChanged) {
        updateData.connection = {
          status: newConnectionStatus,
          lastChecked: new Date().toString(),
        }
      }

      if (shouldUpdateCloudInitStatus) {
        updateData.cloudInitStatus = 'other'
      }

      if (shouldUpdatePublicIp) {
        updateData.publicIp = newPublicIp
      }

      if (shouldUpdateTailscaleIp) {
        updateData.tailscalePrivateIp = newTailscaleIp
      }

      setImmediate(() => {
        payload
          .update({
            collection: 'servers',
            id: doc.id,
            data: updateData,
          })
          .catch(error => {
            console.log(
              'Error updating server connection status and/or cloudInitStatus and/or publicIp:',
              error,
            )
          })
      })
    }

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
      publicIp: newPublicIp ?? doc.publicIp ?? undefined,
      tailscalePrivateIp: newTailscaleIp ?? doc.tailscalePrivateIp,
      connection: {
        status: sshConnected ? 'success' : 'failed',
        lastChecked: new Date().toString(),
      },
    }
  } catch (error) {
    console.error('populateDokkuVersion error:', error)

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
      publicIp: doc.publicIp ?? undefined,
      connection: {
        status: 'failed',
        lastChecked: new Date().toString(),
      },
    }
  }
}
