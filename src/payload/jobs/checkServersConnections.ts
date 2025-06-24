/**
 * Scheduled task to check servers' SSH connectivity
 * This task runs every 5 minutes to verify all servers' SSH connections
 */
import { TaskConfig } from 'payload'

import { dynamicSSH, extractSSHDetails } from '@/lib/ssh'

export const checkServersConnectionsTask: TaskConfig<any> = {
  slug: 'checkServersSshConnections',
  label: 'Check Servers SSH Connections',
  interfaceName: 'CheckServersSshConnections',
  inputSchema: [
    {
      name: 'serverId',
      type: 'text',
      required: false,
    },
  ],
  outputSchema: [
    {
      name: 'checkedServers',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'id',
          type: 'text',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'status',
          type: 'text',
          required: true,
        },
        {
          name: 'error',
          type: 'text',
          required: false,
        },
      ],
    },
    {
      name: 'successCount',
      type: 'number',
      required: true,
    },
    {
      name: 'failedCount',
      type: 'number',
      required: true,
    },
  ],
  handler: async ({ input, job, req }) => {
    const { payload } = req

    console.log('Running servers SSH connectivity check...')

    const checkedServers = []
    let successCount = 0
    let failedCount = 0

    try {
      const where = input.serverId
        ? { id: { equals: input.serverId } }
        : undefined

      const servers = await payload.find({
        collection: 'servers',
        where,
      })

      for (const server of servers.docs) {
        try {
          const sshDetails = extractSSHDetails({ server })
          const ssh = await dynamicSSH(sshDetails)

          const isConnected = ssh.isConnected()

          if (isConnected) {
            successCount++
            checkedServers.push({
              id: server.id,
              name: server.name,
              status: 'success',
            })

            await payload.update({
              collection: 'servers',
              id: server.id,
              data: {
                connection: {
                  status: 'success',
                  lastChecked: new Date().toISOString(),
                },
              },
            })
          } else {
            failedCount++
            checkedServers.push({
              id: server.id,
              name: server.name,
              status: 'failed',
            })

            await payload.update({
              collection: 'servers',
              id: server.id,
              data: {
                connection: {
                  status: 'failed',
                  lastChecked: new Date().toISOString(),
                },
              },
            })
          }
        } catch (error) {
          const connectionError = error as Error
          console.error(
            `Error checking SSH connection to server ${server.id}:`,
            connectionError,
          )

          failedCount++
          checkedServers.push({
            id: server.id,
            name: server.name,
            status: 'error',
            error: connectionError.message,
          })

          await payload.update({
            collection: 'servers',
            id: server.id,
            data: {
              connection: {
                status: 'failed',
                lastChecked: new Date().toISOString(),
              },
            },
          })
        }
      }

      console.log(
        `Servers SSH connectivity check completed: ${successCount} connected, ${failedCount} disconnected`,
      )

      return {
        output: {
          checkedServers,
          successCount,
          failedCount,
        },
      }
    } catch (error) {
      console.error('Error in servers SSH connectivity check task:', error)
      throw error
    }
  },
  onSuccess: () => {
    console.log('Servers SSH connectivity check completed successfully')
  },
  onFail: () => {
    console.error('Servers SSH connectivity check failed')
  },
}
