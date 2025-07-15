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

  const {
    execute: installPlugin,
    hasSucceeded: triggedInstallingPlugin,
    isPending: triggeringLetsencryptPlugin,
  } = useAction(installPluginAction)

  const {
    isPending: isSyncingPlugins,
    hasSucceeded: syncedPlugins,
    result: syncPluginResult,
    executeAsync: syncPlugins,
  } = useAction(syncPluginAction)

  const {
    execute: configureLetsencrypt,
    isPending: triggeringLetsencryptPluginConfiguration,
    hasSucceeded: triggeredLetsencryptPluginConfiguration,
  } = useAction(configureLetsencryptPluginAction)

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

  const pluginsSynced = (syncedPlugins || skipPluginsSync) && !!plugins.length

  const handlePluginsSync = async () => {
    // syncing plugins
    const pluginsData = await syncPlugins({ serverId: server.id })

    const letsEncryptPluginInstalled = pluginsData?.data?.plugins?.find(
      plugin => plugin.name === 'letsencrypt',
    )

    // if letsencrypt plugin not-installed installing it!
    if (!letsEncryptPluginInstalled) {
      installPlugin({
        pluginName: 'letsencrypt',
        serverId: server?.id,
        pluginURL:
          pluginList.find(plugin => plugin.value === 'letsencrypt')
            ?.githubURL ?? '',
      })
    }
  }

  // sync plugins & configure letsencrypt global-email
  useEffect(() => {
    if (dokkuInstallationStep === 3) {
      // 1. check if plugins synced or not
      if (!letsEncryptPluginInstalled) {
        handlePluginsSync()
        return
      }

      if (letsEncryptPluginConfigurationEmail) {
        setDokkuInstallationStep(4)
      }

      // 2. check letsencrypt plugin installed
      // 3. check if letsencrypt email-configuration not done
      if (
        letsEncryptPluginInstalled &&
        !letsEncryptPluginConfigurationEmail &&
        !triggeringLetsencryptPluginConfiguration &&
        !triggeredLetsencryptPluginConfiguration
      ) {
        setSkipPluginsSync(true)

        configureLetsencrypt({
          serverId: server.id,
          autoGenerateSSL: true,
        })
      }
    }
  }, [dokkuInstallationStep, server])

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

      {pluginsSynced && (
        <div className='flex items-center gap-2'>
          <CircleCheck size={24} className='text-primary' />
          {`${plugins.length} Synced plugins`}
        </div>
      )}

      {(triggeringLetsencryptPlugin || triggedInstallingPlugin) && (
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

      {(triggeredLetsencryptPluginConfiguration ||
        triggeredLetsencryptPluginConfiguration) && (
        <div className='flex items-center gap-2'>
          {letsEncryptPluginConfigurationEmail ? (
            <>
              <CircleCheck size={24} className='text-primary' />
              Configured letsencrypt global email
            </>
          ) : (
            <>
              <Loader className='h-max w-max' />
              Configuring letsencrypt global email...
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Step3
