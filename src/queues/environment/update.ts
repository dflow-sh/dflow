import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import configPromise from '@payload-config'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'
import { z } from 'zod'

import { createServiceSchema } from '@/actions/service/validator'
import { pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'
import { Service } from '@/payload-types'

const queueName = 'update-environment-variables'

export type DatabaseType = Exclude<
  z.infer<typeof createServiceSchema>['databaseType'],
  undefined
>

type VariablesType = NonNullable<Service['variables']>

interface QueueArgs {
  sshDetails: {
    privateKey: string
    host: string
    username: string
    port: number
  }
  serviceDetails: {
    name: string
    noRestart: boolean
    variables: VariablesType
    previousVariables: VariablesType
    id: string
  }
  serverDetails: {
    id: string
  }
}

const updateEnvironmentVariablesQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const regex = /\${{\s*(\w+):([\w-]+)\.([\w_]+)\s*}}/
const supportedDatabases = ['postgres', 'mongo', 'mysql', 'redis', 'mariadb']

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const payload = await getPayload({ config: configPromise })
    const { sshDetails, serviceDetails, serverDetails } = job.data
    const { variables, previousVariables } = serviceDetails
    let ssh: NodeSSH | null = null

    console.log(
      `starting updateEnvironmentVariables queue database for service: ${serviceDetails.name}`,
    )

    try {
      ssh = await dynamicSSH(sshDetails)

      const staticVariables: VariablesType = []
      const referenceVariables: VariablesType = []
      const populatedVariables: VariablesType = []

      // step 1: if variables are removed need to clear environment variables in dokku
      if (!variables.length && previousVariables.length) {
        const envResponse = await dokku.config.unset({
          ssh,
          name: serviceDetails.name,
          noRestart: serviceDetails.noRestart,
          keys: previousVariables.map(({ key }) => key),
          options: {
            onStdout: async chunk => {
              console.info(chunk.toString())
              sendEvent({
                pub,
                message: chunk.toString(),
                serverId: serverDetails.id,
              })
            },
            onStderr: async chunk => {
              console.info(chunk.toString())
              sendEvent({
                pub,
                message: chunk.toString(),
                serverId: serverDetails.id,
              })
            },
          },
        })

        if (envResponse.code === 0) {
          const environmentVariables = await dokku.config.listVars(
            ssh,
            serviceDetails.name,
          )

          const formattedEnvironmentVariables = environmentVariables.reduce(
            (acc, curr) => {
              acc[curr.key] = curr.value
              return acc
            },
            {} as Record<string, string>,
          )

          await payload.update({
            collection: 'services',
            id: serviceDetails.id,
            data: {
              populatedVariables: JSON.stringify(formattedEnvironmentVariables),
            },
          })
        }

        return
      }

      // step 2: separation of static and reference variables
      for (let index = 0; index < variables.length; index++) {
        const variable = variables[index]

        const isReferenceVariable = regex.test(variable.value)

        if (isReferenceVariable) {
          referenceVariables.push(variable)
        } else {
          staticVariables.push(variable)
        }
      }

      // step 3: group the reference variables
      const groupedReferenceVariables = Object.entries(
        referenceVariables.reduce(
          (acc, variable) => {
            const key = variable.value
            if (!acc[key]) {
              acc[key] = []
            }
            acc[key].push(variable)
            return acc
          },
          {} as Record<string, VariablesType>,
        ),
      )

      if (groupedReferenceVariables.length) {
        for await (const [
          referenceVariable,
          referenceKeyPairs,
        ] of groupedReferenceVariables) {
          const match = referenceVariable.match(regex)

          console.log({ match, referenceVariable, referenceKeyPairs })

          if (match) {
            const [_variable, databaseType, databaseName, key] = match
            let databaseList: string[] = []
            const formattedDatabaseName = `${databaseName}-db`
            const envAlias = formattedDatabaseName
              .replace(/-([a-z])/g, (_, char) => '_' + char.toUpperCase())
              .toUpperCase()

            // step-3 -> directly check the database is linked or not
            try {
              // in-case of wrong variable syntax thronging error
              if (!supportedDatabases.includes(databaseType)) {
                throw new Error('invalid variable syntax')
              }

              const databaseLinksResponse = await dokku.database.listLinks({
                ssh,
                databaseName,
                databaseType,
              })

              console.log({ databaseLinksResponse })

              databaseList = databaseLinksResponse
            } catch (error) {
              console.log({ error })

              // skipping variables update
              continue
            }

            // db found linked -> directly use the variable -> `$(dokku config:get ${serviceDetails.name} DATABASE_NAME_DB_URL)`
            if (databaseList.includes(serviceDetails.name)) {
              referenceKeyPairs.forEach(keyPair =>
                populatedVariables.push({
                  key: keyPair.key,
                  value: `$(dokku config:get ${serviceDetails.name} ${envAlias}_URL)`,
                }),
              )
            }
            // db found unlinked -> link-database && use this syntax `$(dokku config:get ${serviceDetails.name} DATABASE_NAME_DB_URL)`
            else {
              const databaseLinkResponse = await dokku.database.link({
                ssh,
                databaseName,
                databaseType,
                appName: serviceDetails.name,
                alias: envAlias,
                noRestart: true,
                options: {
                  onStdout: async chunk => {
                    sendEvent({
                      message: chunk.toString(),
                      pub,
                      serverId: serverDetails.id,
                    })
                  },
                  onStderr: async chunk => {
                    sendEvent({
                      message: chunk.toString(),
                      pub,
                      serverId: serverDetails.id,
                    })
                  },
                },
              })

              if (databaseLinkResponse.code === 0) {
                referenceKeyPairs.forEach(keyPair =>
                  populatedVariables.push({
                    key: keyPair.key,
                    value: `$(dokku config:get ${serviceDetails.name} ${envAlias}_URL)`,
                  }),
                )
              } else {
                sendEvent({
                  message: `❌ Failed to link ${databaseName} to ${serviceDetails.name}`,
                  pub,
                  serverId: serverDetails.id,
                })

                // incase of failure not updating environment variables
                continue
              }
            }
          }
        }
      }

      const envResponse = await dokku.config.set({
        ssh,
        name: serviceDetails.name,
        values: [...staticVariables, ...populatedVariables].map(
          ({ key, value }) => {
            return {
              key,
              value,
            }
          },
        ),
        noRestart: serviceDetails.noRestart,
        options: {
          onStdout: async chunk => {
            console.info(chunk.toString())
            sendEvent({
              pub,
              message: chunk.toString(),
              serverId: serverDetails.id,
            })
          },
          onStderr: async chunk => {
            console.info(chunk.toString())
            sendEvent({
              pub,
              message: chunk.toString(),
              serverId: serverDetails.id,
            })
          },
        },
      })

      if (envResponse) {
        sendEvent({
          pub,
          message: `✅ Successfully updated environment variables for ${serviceDetails.name}`,
          serverId: serverDetails.id,
        })

        // after update of env, storing all variables in a json field
        // so we can use them in build args without an computation requirement
        const environmentVariables = await dokku.config.listVars(
          ssh,
          serviceDetails.name,
        )

        const formattedEnvironmentVariables = environmentVariables.reduce(
          (acc, curr) => {
            acc[curr.key] = curr.value
            return acc
          },
          {} as Record<string, string>,
        )

        await payload.update({
          collection: 'services',
          id: serviceDetails.id,
          data: {
            populatedVariables: JSON.stringify(formattedEnvironmentVariables),
          },
        })

        sendEvent({
          pub,
          message: `Syncing details...`,
          serverId: serverDetails.id,
        })

        await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))
      } else {
        sendEvent({
          pub,
          message: `❌ Failed update environment variables for ${serviceDetails.name}`,
          serverId: serverDetails.id,
        })
      }
    } catch (error) {
      let message = error instanceof Error ? error.message : ''
      throw new Error(
        `❌ Failed update environment variables for ${serviceDetails?.name}: ${message}`,
      )
    } finally {
      ssh?.dispose()
    }
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed update environment variables', err)

  if (job?.data) {
    sendEvent({
      pub,
      message: err.message,
      serverId: job.data.serverDetails.id,
    })
  }
})

export const addUpdateEnvironmentVariablesQueue = async (data: QueueArgs) =>
  await updateEnvironmentVariablesQueue.add(queueName, data)
