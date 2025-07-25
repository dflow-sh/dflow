import configPromise from '@payload-config'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@/lib/bullmq'
import { dokku } from '@/lib/dokku'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent } from '@/lib/sendEvent'
import { dynamicSSH, extractSSHDetails } from '@/lib/ssh'
import { Project, Service } from '@/payload-types'

interface QueueArgs {
  serverDetails: {
    id: string
  }
  project: Project
  service: Omit<Service, 'project'>
  restart: boolean
  tenantDetails: {
    slug: string
  }
}

type VolumeFromDokku = {
  host_path: string
  container_path: string
  volume_option?: string
}

export const updateVolumesQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-add-volume`

  const deployTemplateQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  getWorker<QueueArgs>({
    name: QUEUE_NAME,
    connection: queueConnection,
    processor: async job => {
      const { service, tenantDetails, restart = false, project } = job.data

      const payload = await getPayload({ config: configPromise })

      const DOKKU_STORAGE_PATH = '/var/lib/dokku/data/storage/'

      try {
        if (
          typeof project === 'object' &&
          typeof project?.server === 'object'
        ) {
          let ssh: NodeSSH | null = null

          const sshDetails = extractSSHDetails({ project })

          ssh = await dynamicSSH(sshDetails)

          const list = (await dokku.volumes.list(
            ssh,
            service.name,
          )) as VolumeFromDokku[]

          const volumesList = service.volumes ?? []

          const extractHostPath = (fullPath: string) => {
            if (typeof fullPath !== 'string') return ''

            const parts = fullPath.split('/')

            if (parts.length >= 8) {
              return parts.slice(7).join('/')
            }

            return ''
          }

          const isSameVolume = (
            a: { hostPath: string },
            b: { host_path: string },
          ): boolean => {
            const expected = `${DOKKU_STORAGE_PATH}${service.name}/${a.hostPath}`
            return b.host_path === expected
          }

          const addedVolumes = volumesList?.filter(
            volume => !list.some(existing => isSameVolume(volume, existing)),
          )

          const deletedVolumes = list.filter(
            existing =>
              !volumesList?.some(volume => isSameVolume(volume, existing)),
          )

          if (addedVolumes?.length) {
            for await (const volume of addedVolumes) {
              try {
                await dokku.volumes.mount({
                  appName: service.name,
                  ssh,
                  volume,
                })
              } catch (err) {
                console.error(`Failed to mount volume`, volume, err)
              }
            }
          }

          if (deletedVolumes?.length) {
            for await (const volume of deletedVolumes) {
              try {
                await dokku.volumes.unmount({
                  appName: service.name,
                  ssh,
                  volume,
                })
              } catch (err) {
                console.error(`Failed to unmount volume`, volume, err)
              }
            }
          }

          const updatedDokkuVolumes = (await dokku.volumes.list(
            ssh,
            service.name,
          )) as VolumeFromDokku[]

          const failedVolumes = volumesList?.filter(
            volume =>
              !updatedDokkuVolumes?.some(existing =>
                isSameVolume(volume, existing),
              ),
          )

          const availableDokkuVolumes = updatedDokkuVolumes?.map(volume => ({
            hostPath: extractHostPath(volume.host_path),
            containerPath: volume.container_path,
            created: true,
          }))

          await payload.update({
            collection: 'services',
            id: service.id,
            data: {
              volumes: [...availableDokkuVolumes, ...failedVolumes],
            },
          })

          sendActionEvent({
            pub,
            action: 'refresh',
            tenantSlug: tenantDetails.slug,
          })

          if (restart) {
            await dokku.process.restart(ssh, service.name)
          }
        }
      } catch (error) {
        let message = error instanceof Error ? error.message : ''
        throw new Error(message)
      }
    },
  })

  const id = `add-volume:${new Date().getTime()}`
  return await deployTemplateQueue.add(id, data, { ...jobOptions, jobId: id })
}
