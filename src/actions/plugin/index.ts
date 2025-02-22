'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { dokku } from '@/lib/dokku'
import { pub } from '@/lib/redis'
import { protectedClient } from '@/lib/safe-action'
import { dynamicSSH } from '@/lib/ssh'

import {
  installPluginSchema,
  syncPluginSchema,
  togglePluginStatusSchema,
} from './validator'

const payload = await getPayload({ config: configPromise })

export const installPluginAction = protectedClient
  .metadata({
    actionName: 'installPluginAction',
  })
  .schema(installPluginSchema)
  .action(async ({ clientInput }) => {
    const { plugin, serverId } = clientInput

    // Fetching server details instead of passing from client
    const { id, ip, username, port, sshKey } = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 5,
    })

    if (!id) {
      throw new Error('Server not found')
    }

    if (typeof sshKey !== 'object') {
      throw new Error('SSH key not found')
    }

    const sshDetails = {
      host: ip,
      port,
      username,
      privateKey: sshKey.privateKey,
    }

    const ssh = await dynamicSSH(sshDetails)

    if (plugin === 'mongo') {
      const mongoInstallationResponse = await dokku.database.mongo.install({
        ssh,
        options: {
          onStdout: async chunk => {
            await pub.publish('my-channel', chunk.toString())
            console.info(chunk.toString())
          },
          onStderr: async chunk => {
            await pub.publish('my-channel', chunk.toString())
            console.info({
              installMongoLogs: {
                message: chunk.toString(),
                type: 'stdout',
              },
            })
          },
        },
      })

      console.log({ mongoInstallationResponse })
    } else if (plugin === 'mysql') {
      const mySQLInstallationResponse = await dokku.database.mysql.install({
        ssh,
        options: {
          onStdout: async chunk => {
            await pub.publish('my-channel', chunk.toString())
            console.info(chunk.toString())
          },
          onStderr: async chunk => {
            await pub.publish('my-channel', chunk.toString())
            console.info({
              installMySQLLogs: {
                message: chunk.toString(),
                type: 'stdout',
              },
            })
          },
        },
      })

      console.log({ mySQLInstallationResponse })
    }

    // Updating the plugin list of the server
    const pluginsResponse = await dokku.plugin.list(ssh)

    await payload.update({
      collection: 'servers',
      id: serverId,
      data: {
        plugins: pluginsResponse.plugins.map(plugin => ({
          name: plugin.name,
          status: plugin.status ? 'enabled' : 'disabled',
          version: plugin.version,
        })),
      },
    })

    ssh.dispose()

    revalidatePath(`/settings/servers/${serverId}/general`)
    return { success: true }
  })

export const syncPluginAction = protectedClient
  .metadata({
    actionName: 'syncPluginAction',
  })
  .schema(syncPluginSchema)
  .action(async ({ clientInput }) => {
    const { serverId } = clientInput

    // Fetching server details instead of passing from client
    const { id, ip, username, port, sshKey } = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 5,
    })

    if (!id) {
      throw new Error('Server not found')
    }

    if (typeof sshKey !== 'object') {
      throw new Error('SSH key not found')
    }

    const sshDetails = {
      host: ip,
      port,
      username,
      privateKey: sshKey.privateKey,
    }

    const ssh = await dynamicSSH(sshDetails)

    // getting the plugin list of the server
    const pluginsResponse = await dokku.plugin.list(ssh)

    // Updating plugin list in database
    await payload.update({
      collection: 'servers',
      id: serverId,
      data: {
        plugins: pluginsResponse.plugins.map(plugin => ({
          name: plugin.name,
          status: plugin.status ? 'enabled' : 'disabled',
          version: plugin.version,
        })),
      },
    })

    ssh.dispose()

    revalidatePath(`/settings/servers/${serverId}/general`)
    return { success: true }
  })

export const togglePluginStatusAction = protectedClient
  .metadata({
    actionName: 'togglePluginStatusAction',
  })
  .schema(togglePluginStatusSchema)
  .action(async ({ clientInput }) => {
    const { plugin, serverId, enabled } = clientInput

    // Fetching server details instead of passing from client
    const { id, ip, username, port, sshKey } = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 5,
    })

    if (!id) {
      throw new Error('Server not found')
    }

    if (typeof sshKey !== 'object') {
      throw new Error('SSH key not found')
    }

    const sshDetails = {
      host: ip,
      port,
      username,
      privateKey: sshKey.privateKey,
    }

    const ssh = await dynamicSSH(sshDetails)

    const pluginStatusResponse = await dokku.plugin.toggle({
      enabled,
      pluginName: plugin,
      ssh,
    })

    if (pluginStatusResponse.code === 0) {
      // getting the plugin list of the server
      const pluginsResponse = await dokku.plugin.list(ssh)

      // Updating plugin list in database
      await payload.update({
        collection: 'servers',
        id: serverId,
        data: {
          plugins: pluginsResponse.plugins.map(plugin => ({
            name: plugin.name,
            status: plugin.status ? 'enabled' : 'disabled',
            version: plugin.version,
          })),
        },
      })
    }

    ssh.dispose()
    revalidatePath(`/settings/servers/${serverId}/general`)
    return { success: true }
  })
