import configPromise from '@payload-config'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@/lib/bullmq'
import { dokku } from '@/lib/dokku'
import { jobOptions, queueConnection } from '@/lib/redis'
import { dynamicSSH } from '@/lib/ssh'
import { Project, Service } from '@/payload-types'

interface QueueArgs {
  serverDetails: {
    id: string
  }
  service: Service

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

  // todo: need to add deployment strategy which will sort the services or based on dependency
  // todo: change the waitForJobCompletion method from for-loop to performant way
  getWorker<QueueArgs>({
    name: QUEUE_NAME,
    connection: queueConnection,
    processor: async job => {
      const { service, serverDetails, tenantDetails } = job.data
      const project = service.project as Project
      const payload = await getPayload({ config: configPromise })

      try {
        if (
          typeof project === 'object' &&
          typeof project?.server === 'object' &&
          typeof project?.server?.sshKey === 'object'
        ) {
          let ssh: NodeSSH | null = null
          const sshDetails = {
            privateKey: project?.server?.sshKey?.privateKey,
            host: project?.server?.ip,
            username: project?.server?.username,
            port: project?.server?.port,
          }

          ssh = await dynamicSSH(sshDetails)

          const list = (await dokku.volumes.list(
            ssh,
            service.name,
          )) as VolumeFromDokku[]

          const volumesList = service.volumes ?? []

          const isSameVolume = (
            a: { hostPath: string },
            b: { host_path: string },
          ) => a.hostPath === b.host_path.split('/').at(-1)

          const addedVolumes = volumesList?.filter(
            volume => !list.some(existing => isSameVolume(volume, existing)),
          )
          console.log('added Volumes', addedVolumes)
          // Deleted volumes: in list but not in volumesList
          const deletedVolumes = list.filter(
            existing =>
              !volumesList?.some(volume => isSameVolume(volume, existing)),
          )
          console.log('deleted Volumes', deletedVolumes)

          console.log('dokku fetched volumes', list)

          if (addedVolumes?.length) {
            // const volumesResult = await Promise.allSettled(
            //   addedVolumes.map(volume =>
            //     dokku.volumes.mount({
            //       appName: service.name,
            //       ssh,
            //       volume,
            //     }),
            //   ),
            // )

            for await (const volume of addedVolumes) {
              const volumeMountResult = await dokku.volumes.mount({
                appName: service.name,
                ssh,
                volume,
              })

              console.dir(
                {
                  volumeMountResult,
                  volume,
                },
                { depth: null },
              )
            }

            // volumesResult.forEach((result, index) => {
            //   const { hostPath, containerPath } = addedVolumes[index]
            //   if (result.status === 'fulfilled') {
            //     console.log(`✅ Mounted: ${hostPath} -> ${containerPath}`)
            //   } else {
            //     console.error(
            //       `❌ Failed: ${hostPath} -> ${containerPath}`,
            //       result.reason,
            //     )
            //   }
            // })
          }

          if (deletedVolumes?.length) {
            // const volumesResult = await Promise.allSettled(
            //   deletedVolumes.map(volume =>
            //     dokku.volumes.unmount({
            //       appName: service.name,
            //       ssh,
            //       volume,
            //     }),
            //   ),
            // )

            for await (const volume of deletedVolumes) {
              const volumeUnmountResult = await dokku.volumes.unmount({
                appName: service.name,
                ssh,
                volume,
              })

              console.dir(
                {
                  volumeUnmountResult,
                },
                { depth: null },
              )
            }

            // volumesResult.forEach((result, index) => {
            //   const { container_path, host_path } = deletedVolumes[index]
            //   if (result.status === 'fulfilled') {
            //     console.dir({
            //       message: `✅ Unmounted: ${host_path} -> ${container_path}`,
            //       result: result.value,
            //     })
            //   } else {
            //     console.error(
            //       `❌ Failed: ${host_path} -> ${container_path}`,
            //       result.reason,
            //     )
            //   }
            // })
          }

          const updatedDokkuVolumes = (await dokku.volumes.list(
            ssh,
            service.name,
          )) as VolumeFromDokku[]

          console.dir({ updatedDokkuVolumes }, { depth: Infinity })

          const dokkuHostNames = updatedDokkuVolumes.map(v =>
            v.host_path.split('/').at(-1),
          )

          const currentAvailableVolumes = volumesList.map(volume => ({
            ...volume,
            created: dokkuHostNames.includes(volume.hostPath),
          }))

          const updatedValues = await payload.update({
            collection: 'services',
            id: service.id,
            data: {
              volumes: currentAvailableVolumes,
            },
          })

          // todo: add dokku.apps.restart
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
