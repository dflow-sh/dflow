// lib
import type Redis from 'ioredis'
import { NodeSSH } from 'node-ssh'

import { dokku } from './dokku'
import { sendEvent } from './sendEvent'

export const updatePorts = async ({
  ssh,
  appName,
  ports,
  logOptions: { pub, serverId, channelId, serviceId },
}: {
  ssh: NodeSSH
  appName: string
  ports: string[]
  logOptions: {
    serverId: string
    serviceId?: string
    pub: Redis
    channelId?: string
  }
}) => {
  // 1. list exposed ports
  const exposedPorts = await dokku.ports.report(ssh, appName)

  // 2. filter the unsynced ports
  const unsyncedPorts = ports.filter(
    port => !exposedPorts.find(exposedPort => exposedPort === port),
  )

  // 3. skip in-case all ports are synced
  if (!unsyncedPorts.length) {
    sendEvent({
      message: `${ports.join(',')} already exposed skipping exposure!`,
      pub,
      serverId,
      channelId,
      serviceId,
    })

    return
  }

  // 4. filter the conflicting host ports
  const conflictPort = exposedPorts.filter(exposedPort => {
    const hostMapping = exposedPort.split(':').splice(0, 2).join(':')

    return unsyncedPorts.some(newPort => {
      const exists = newPort.includes(hostMapping)
      return exists
    })
  })

  // 5. remove the conflicting ports
  if (conflictPort.length) {
    sendEvent({
      message: `${conflictPort.join(', ')} removing exposed ports`,
      pub,
      serverId,
      channelId,
      serviceId,
    })

    await dokku.ports.remove({
      ssh,
      appName,
      ports: conflictPort.map(conflictPort => {
        const [scheme, host, container] = conflictPort.split(':')

        return {
          scheme,
          host,
          container,
        }
      }),
      options: {
        onStdout: async chunk => {
          sendEvent({
            message: chunk.toString(),
            pub,
            serverId,
            serviceId,
            channelId,
          })
        },
        onStderr: async chunk => {
          sendEvent({
            message: chunk.toString(),
            pub,
            serverId,
            serviceId,
            channelId,
          })
        },
      },
    })
  }

  // 4. add the new ports
  await dokku.ports.add({
    ssh,
    appName,
    ports: unsyncedPorts.map(port => {
      const [scheme, host, container] = port.split(':')

      return {
        scheme,
        host,
        container,
      }
    }),
    options: {
      onStdout: async chunk => {
        sendEvent({
          message: chunk.toString(),
          pub,
          serverId,
          serviceId,
          channelId,
        })
      },
      onStderr: async chunk => {
        sendEvent({
          message: chunk.toString(),
          pub,
          serverId,
          serviceId,
          channelId,
        })
      },
    },
  })

  sendEvent({
    message: `✅ Successfully exposed ports ${unsyncedPorts.join(', ')}`,
    pub,
    serverId,
    serviceId,
    channelId,
  })
}
