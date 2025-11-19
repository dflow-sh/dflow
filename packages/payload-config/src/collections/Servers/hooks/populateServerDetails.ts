import isPortReachable from 'is-port-reachable'
import { CollectionAfterReadHook } from 'payload'

import { server } from '@/lib/server'
import { dynamicSSH, extractSSHDetails } from '@/lib/ssh'
import checkDpkgLock from '@/lib/utils/checkDpkgLock'
import { Server } from '@/payload-types'

export const populateServerDetails: CollectionAfterReadHook<Server> = async ({
  doc,
  context,
  req,
}) => {
  const { payload } = req

  try {
    // If neither populateServerDetails nor refreshServerDetails is true, skip processing
    if (!context.populateServerDetails && !context.refreshServerDetails) {
      return doc
    }

    const forceRefresh = Boolean(context.refreshServerDetails)
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
        tailscalePrivateIp: doc.tailscalePrivateIp ?? undefined,
        cloudInitStatus: doc.cloudInitStatus ?? undefined,
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
    let dpkgLocked: boolean | undefined = undefined

    // Attempt SSH connection if possible
    let shouldUpdateCloudInitStatus = false
    let shouldUpdatePublicIp = false
    let shouldUpdateTailscaleIp = false
    let cloudInitStatus: 'running' | 'other' | null | undefined = undefined
    let newPublicIp: string | undefined = undefined
    let newTailscaleIp: string | undefined = undefined

    if (portIsOpen) {
      const ssh = await dynamicSSH(sshDetails)

      try {
        if (ssh.isConnected()) {
          sshConnected = true

          // Check dpkg lock status
          try {
            await checkDpkgLock(ssh)
            dpkgLocked = false
          } catch (err) {
            dpkgLocked = true
          }

          // Gather server information
          const serverInfo = await server.info({ ssh })

          dokku = serverInfo.dokkuVersion
          netdata = serverInfo.netdataVersion
          linuxVersion = serverInfo.linuxDistributionVersion
          linuxType = serverInfo.linuxDistributionType
          railpack = serverInfo.railpackVersion

          // If forceRefresh is true or cloudInitStatus is running, check and update if needed
          if (forceRefresh || doc.cloudInitStatus === 'running') {
            try {
              const { stdout: cloudInitStatusOut } =
                await ssh.execCommand('cloud-init status')

              console.log('cloudInitStatusOut:', cloudInitStatusOut)

              const statusMatch = cloudInitStatusOut.match(/status:\s*(\w+)/)
              let status: 'running' | 'other' | null | undefined = statusMatch
                ? (statusMatch[1] as 'running' | 'other')
                : undefined

              // Convert status to lowercase and set to running if it's running, otherwise set to other
              status = status?.toLowerCase() === 'running' ? 'running' : 'other'

              if (forceRefresh || (status && status !== doc.cloudInitStatus)) {
                shouldUpdateCloudInitStatus = true
                cloudInitStatus = status
              }
            } catch (cloudInitError) {
              console.log('Error checking cloud-init status:', cloudInitError)
            }
          }

          // Only check IPs if missing or if forceRefresh is true
          if (forceRefresh || !doc.publicIp || !doc.tailscalePrivateIp) {
            try {
              // Get public IP from external service
              const { stdout: publicIpOut } = await ssh.execCommand(
                'curl -4 ifconfig.me',
              )
              const publicIp = publicIpOut.trim()

              // Get all local IPs in JSON
              const { stdout: ipAddrOut } = await ssh.execCommand('ip -j addr')
              let ipJson: {
                ifname: string
                addr_info: { family: string; local: string }[]
              }[] = []
              try {
                ipJson = JSON.parse(ipAddrOut)
              } catch (jsonErr) {
                ipJson = []
              }

              // Extract Tailscale IP (most readable approach)
              const tailscaleIp = ipJson
                .find(
                  (iface: { ifname: string }) => iface?.ifname === 'tailscale0',
                )
                ?.addr_info?.find(
                  (addr: { family: string; local: string }) =>
                    addr?.family === 'inet',
                )?.local as string | undefined

              console.log('tailscaleIp:', tailscaleIp)

              // Extract all local IPs using flatMap
              const allIps = ipJson
                .flatMap(
                  (iface: { addr_info: { local: string }[] }) =>
                    iface?.addr_info || [],
                )
                .map((addr: { local: string }) => addr?.local)
                .filter(Boolean)

              // Update Tailscale IP if found
              if (
                forceRefresh ||
                (tailscaleIp && tailscaleIp !== doc.tailscalePrivateIp)
              ) {
                newTailscaleIp = tailscaleIp
                shouldUpdateTailscaleIp = true
              }

              // Update public IP based on validation
              if (forceRefresh) {
                if (publicIp && allIps.includes(publicIp)) {
                  newPublicIp = publicIp
                } else {
                  newPublicIp = '999.999.999.999'
                }
              }

              if (forceRefresh || (publicIp && publicIp !== doc.publicIp)) {
                shouldUpdatePublicIp = true
              }
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

    const prevStatus = doc.connection?.status
    const newConnectionStatus = sshConnected ? 'success' : 'failed'
    const connectionStatusChanged =
      forceRefresh || prevStatus !== newConnectionStatus

    if (
      connectionStatusChanged ||
      shouldUpdateCloudInitStatus ||
      shouldUpdatePublicIp ||
      shouldUpdateTailscaleIp
    ) {
      const updateData: Partial<Server> = {}

      // If previous status is 'not-checked-yet', only update to 'success' if connected
      // If previous status is 'failed' or 'success', always update to the new result (success or failed)
      if (connectionStatusChanged) {
        if (prevStatus === 'not-checked-yet' && sshConnected) {
          updateData.connection = {
            status: 'success',
            lastChecked: new Date().toString(),
          }
        } else if (prevStatus === 'failed' || prevStatus === 'success') {
          updateData.connection = {
            status: newConnectionStatus,
            lastChecked: new Date().toString(),
          }
        }
      }

      if (shouldUpdateCloudInitStatus) {
        updateData.cloudInitStatus = cloudInitStatus
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
      cloudInitStatus: cloudInitStatus ?? doc.cloudInitStatus,
      connection: {
        status:
          prevStatus === 'not-checked-yet'
            ? sshConnected
              ? 'success'
              : 'not-checked-yet'
            : newConnectionStatus,
        lastChecked: new Date().toString(),
      },
      dpkgLocked,
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
      tailscalePrivateIp: doc.tailscalePrivateIp ?? undefined,
      cloudInitStatus: doc.cloudInitStatus ?? undefined,
      connection: {
        status: 'failed',
        lastChecked: new Date().toString(),
      },
    }
  }
}
