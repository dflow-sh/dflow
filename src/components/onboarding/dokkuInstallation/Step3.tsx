'use client'

import { CircleCheck } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'

import {
  configureLetsencryptPluginAction,
  installPluginAction,
  syncPluginAction,
} from '@/actions/plugin'
import Loader from '@/components/Loader'
import { pluginList } from '@/components/plugins'
import { ServerType } from '@/payload-types-overrides'

import { useDokkuInstallationStep } from './DokkuInstallationStepContext'

const Step3 = ({ server }: { server: ServerType }) => {
  const [skipPluginsSync, setSkipPluginsSync] = useState(false)
  const { dokkuInstallationStep, setDokkuInstallationStep } =
    useDokkuInstallationStep()

  const { execute: installPlugin, hasSucceeded: triggedInstallingPlugin } =
    useAction(installPluginAction)

  const {
    execute: syncPlugins,
    isPending: isSyncingPlugins,
    hasSucceeded: syncedPlugins,
    result: syncPluginResult,
  } = useAction(syncPluginAction)

  const { execute: configureLetsencrypt } = useAction(
    configureLetsencryptPluginAction,
  )

  const plugins = syncPluginResult?.data?.plugins || server?.plugins || []
  const letsEncryptPluginInstalled = plugins.find(
    plugin => plugin.name === 'letsencrypt',
  )
  const letsEncryptPluginConfigurationEmail =
    letsEncryptPluginInstalled &&
    letsEncryptPluginInstalled.configuration &&
    typeof letsEncryptPluginInstalled.configuration === 'object' &&
    !Array.isArray(letsEncryptPluginInstalled.configuration) &&
    letsEncryptPluginInstalled.configuration.email

  // Sync plugins
  useEffect(() => {
    if (dokkuInstallationStep === 3) {
      // 1. if all plugins are already installed skipping plugin installation dokkuInstallationStep
      if (letsEncryptPluginInstalled) {
        setSkipPluginsSync(true)
        setDokkuInstallationStep(4)
      } else {
        // 2. if not installed syncing plugins
        syncPlugins({ serverId: server.id })
      }
    }
  }, [dokkuInstallationStep, server])

  // Check letsencrypt plugin status
  useEffect(() => {
    const plugins = syncPluginResult.data?.plugins

    if (dokkuInstallationStep === 3) {
      if (plugins) {
        const letsEncryptPluginInstalled = plugins.filter(
          plugin => plugin.name === 'letsencrypt',
        )[0]

        // 3. Once plugin are synced checking letsencrypt plugin status if not installed then installing
        if (!letsEncryptPluginInstalled) {
          installPlugin({
            pluginName: 'letsencrypt',
            serverId: server?.id,
            pluginURL:
              pluginList.find(plugin => plugin.value === 'letsencrypt')
                ?.githubURL ?? '',
          })
        } else {
          // 4. If letsencrypt plugin is installed go to the next dokkuInstallationStep
          setDokkuInstallationStep(4)
        }
      }
    }
  }, [syncPluginResult, server])

  // Configure letsencrypt plugin
  useEffect(() => {
    if (
      dokkuInstallationStep === 3 &&
      (isSyncingPlugins || letsEncryptPluginInstalled) &&
      !letsEncryptPluginConfigurationEmail
    ) {
      console.log('Configuring letsencrypt')
      console.log('letsEncryptPluginInstalled', letsEncryptPluginInstalled)

      configureLetsencrypt({
        serverId: server.id,
        autoGenerateSSL: true,
      })
    }
  }, [
    dokkuInstallationStep,
    isSyncingPlugins,
    letsEncryptPluginInstalled,
    letsEncryptPluginConfigurationEmail,
    server.id,
  ])

  if (dokkuInstallationStep < 3) {
    return null
  }

  return (
    <div className='space-y-2'>
      {isSyncingPlugins && !letsEncryptPluginInstalled && (
        <div className='flex items-center gap-2'>
          <Loader className='h-max w-max' /> Syncing plugins...
        </div>
      )}

      {(syncedPlugins || skipPluginsSync) && !!plugins.length && (
        <div className='flex items-center gap-2'>
          <CircleCheck size={24} className='text-primary' />
          {`${plugins.length} Synced plugins`}
        </div>
      )}

      {triggedInstallingPlugin && (
        <div className='flex items-center gap-2'>
          {letsEncryptPluginInstalled ? (
            <>
              <CircleCheck size={24} className='text-primary' />
              Installed letsencrypt plugin
            </>
          ) : (
            <>
              <Loader className='h-max w-max' />
              Installing letsencrypt plugin...
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Step3
