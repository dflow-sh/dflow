import configPromise from "@core/payload.config"
import { Job } from 'bullmq'
import isPortReachable from 'is-port-reachable'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'

import { getQueue, getWorker } from "@core/lib/bullmq"
import { jobOptions, pub, queueConnection } from "@core/lib/redis"
import { sendEvent } from "@core/lib/sendEvent"
import { dynamicSSH, extractSSHDetails } from "@core/lib/ssh"
import { Server } from "@core/payload-types"

interface QueueArgs {
  tenant: {
    slug: string
    id: string
  }
  refreshServerDetails?: boolean
}

export const checkServersSSHConnectionQueue = async (data: QueueArgs) => {
  const payload = await getPayload({ config: configPromise })

  const QUEUE_NAME = `servers-${data.tenant.id}-check-ssh-connection`

  const resetServerQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { tenant, refreshServerDetails = false } = job.data

      const skipServerStatusCheck = await pub.get(
        `tenant-${tenant.id}-skip-server-status-check`,
      )

      // Skipping status check if lastChecked is within 2 minutes for now to ensure queues run properly
      if (skipServerStatusCheck === 'true') {
        return
      } else {
        await pub.set(
          `tenant-${tenant.id}-skip-server-status-check`,
          'true',
          'EX',
          120,
        )
      }

      const { docs: servers } = await payload.find({
        collection: 'servers',
        where: { tenant: { equals: tenant.id } },
        pagination: false,
        depth: 1,
      })

      console.log('Server status update queue got triggered', servers.length)
      await Promise.all(
        servers.map(async server => {
          let ssh: NodeSSH | null = null
          const sshDetails = extractSSHDetails({ server })

          console.log(
            `Updating server details of: ${server.id} - ${server.name}`,
          )

          // Extract connection parameters
          const isTailscale = server.preferConnectionType === 'tailscale'
          const port = server.port ?? 22
          const host = isTailscale ? (server.hostname ?? '') : (server.ip ?? '')
          let sshConnected = false

          try {
            // if no host is available marking connection as failed
            if (!host) {
              await payload.update({
                collection: 'servers',
                id: server.id,
                data: {
                  connection: {
                    status: 'failed',
                    lastChecked: new Date().toString(),
                  },
                },
              })

              return
            }

            // Check if port is reachable
            const portIsOpen = await isPortReachable(port, { host })

            let shouldUpdateCloudInitStatus = false
            let shouldUpdatePublicIp = false
            let shouldUpdateTailscaleIp = false
            let cloudInitStatus: 'running' | 'other' | null | undefined =
              undefined
            let newPublicIp: string | undefined = undefined
            let newTailscaleIp: string | undefined = undefined

            if (portIsOpen) {
              // Attempting SSH connection
              ssh = await dynamicSSH(sshDetails)

              // If forceRefresh is true checking cloudInitStatus, IPs
              try {
                if (ssh.isConnected()) {
                  sshConnected = true

                  if (server.cloudInitStatus === 'running') {
                    try {
                      const { stdout: cloudInitStatusOut } =
                        await ssh.execCommand('cloud-init status')

                      console.log('cloudInitStatusOut:', cloudInitStatusOut)

                      const statusMatch =
                        cloudInitStatusOut.match(/status:\s*(\w+)/)

                      let status: 'running' | 'other' | null | undefined =
                        statusMatch
                          ? (statusMatch[1] as 'running' | 'other')
                          : undefined

                      // Convert status to lowercase and set to running if it's running, otherwise set to other
                      status =
                        status?.toLowerCase() === 'running'
                          ? 'running'
                          : 'other'

                      // if (
                      //   forceRefresh ||
                      //   (status && status !== doc.cloudInitStatus)
                      // ) {
                      //   shouldUpdateCloudInitStatus = true
                      //   cloudInitStatus = status
                      // }
                    } catch (cloudInitError) {
                      console.log(
                        'Error checking cloud-init status:',
                        cloudInitError,
                      )
                    }
                  }

                  if (
                    refreshServerDetails ||
                    !server.publicIp ||
                    !server.tailscalePrivateIp
                  ) {
                    try {
                      // Get public IP from external service
                      const { stdout: publicIpOut } = await ssh.execCommand(
                        'curl -4 ifconfig.me',
                      )

                      const publicIp = publicIpOut.trim()

                      // Get all local IPs in JSON
                      const { stdout: ipAddrOut } =
                        await ssh.execCommand('ip -j addr')

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
                          (iface: { ifname: string }) =>
                            iface?.ifname === 'tailscale0',
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
                        refreshServerDetails ||
                        (tailscaleIp &&
                          tailscaleIp !== server.tailscalePrivateIp)
                      ) {
                        newTailscaleIp = tailscaleIp
                        shouldUpdateTailscaleIp = true
                      }

                      // Update public IP based on validation
                      if (refreshServerDetails) {
                        if (publicIp && allIps.includes(publicIp)) {
                          newPublicIp = publicIp
                        } else {
                          newPublicIp = '999.999.999.999'
                        }
                      }

                      if (
                        refreshServerDetails ||
                        (publicIp && publicIp !== server.publicIp)
                      ) {
                        shouldUpdatePublicIp = true
                      }
                    } catch (publicIpErr) {
                      console.log('Error fetching public IP:', publicIpErr)
                    }
                  }
                }

                ssh.dispose()
              } catch (error) {
                console.log(`Connection error for ${server.name}:`, error)
                ssh.dispose()
              }

              const prevStatus = server.connection?.status
              const newConnectionStatus = sshConnected ? 'success' : 'failed'
              const connectionStatusChanged =
                refreshServerDetails || prevStatus !== newConnectionStatus

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
                  } else if (
                    prevStatus === 'failed' ||
                    prevStatus === 'success'
                  ) {
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

                await payload.update({
                  collection: 'servers',
                  id: server.id,
                  data: updateData,
                })
              }
            }
          } catch (e) {
            ssh?.dispose()
          }
        }),
      )

      console.log('Updated all server details')
    },
    connection: queueConnection,
  })

  worker.on('failed', async (job: Job | undefined, err) => {
    if (job?.data) {
      sendEvent({
        pub,
        message: `Job failed: ${err.message}`,
        serverId: job.data.serverDetails.id,
      })
    }
  })

  const id = `check-ssh-connection-server:${new Date().getTime()}`

  return await resetServerQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
