'use client'

import { CircleCheck } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { toast } from 'sonner'

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
  const { dokkuInstallationStep, setDokkuInstallationStep } =
    useDokkuInstallationStep()

  const {
    execute: installPlugin,
    hasSucceeded: triggedInstallingPlugin,
    isPending: triggeringInstallingPlugin,
  } = useAction(installPluginAction, {
    onError: ({ error }) => {
      toast.error(`Failed to install plugin: ${error.serverError}`)
    },
  })

  const { isPending: isSyncingPlugins, executeAsync: syncPlugins } = useAction(
    syncPluginAction,
    {
      onError: ({ error }) => {
        toast.error(`Failed to sync plugins: ${error?.serverError}`)
      },
    },
  )

  const {
    execute: configureLetsencrypt,
    isPending: triggeringLetsencryptPluginConfiguration,
    hasSucceeded: triggeredLetsencryptPluginConfiguration,
  } = useAction(configureLetsencryptPluginAction, {
    onError: ({ error }) => {
      toast.error(`Failed to update config: ${error?.serverError}`)
    },
  })

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
      const plugins = server?.plugins || []
      const letsEncryptPluginInstalled = plugins.find(
        plugin => plugin.name === 'letsencrypt',
      )

      const letsEncryptPluginConfigurationEmail =
        letsEncryptPluginInstalled &&
        letsEncryptPluginInstalled.configuration &&
        typeof letsEncryptPluginInstalled.configuration === 'object' &&
        !Array.isArray(letsEncryptPluginInstalled.configuration) &&
        letsEncryptPluginInstalled.configuration.email

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
        console.log({
          letsEncryptPluginInstalled,
          letsEncryptPluginConfigurationEmail,
          triggeringLetsencryptPluginConfiguration,
          triggeredLetsencryptPluginConfiguration,
        })

        configureLetsencrypt({
          serverId: server.id,
          autoGenerateSSL: true,
        })
      }
    }
  }, [dokkuInstallationStep, JSON.stringify(server)])

  const plugins = server?.plugins || []
  const letsEncryptPluginInstalled = plugins.find(
    plugin => plugin.name === 'letsencrypt',
  )

  const letsEncryptPluginConfigurationEmail =
    letsEncryptPluginInstalled &&
    letsEncryptPluginInstalled.configuration &&
    typeof letsEncryptPluginInstalled.configuration === 'object' &&
    !Array.isArray(letsEncryptPluginInstalled.configuration) &&
    letsEncryptPluginInstalled.configuration.email

  return dokkuInstallationStep >= 3 ? (
    <div className='space-y-2'>
      {isSyncingPlugins ? (
        <div className='flex items-center gap-2'>
          <Loader className='h-max w-max' /> Syncing plugins...
        </div>
      ) : !!plugins.length ? (
        <div className='flex items-center gap-2'>
          <CircleCheck size={24} className='text-primary' />
          {`${plugins.length} Synced plugins`}
        </div>
      ) : null}

      {(triggeringInstallingPlugin ||
        triggedInstallingPlugin ||
        letsEncryptPluginInstalled) && (
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
        triggeredLetsencryptPluginConfiguration ||
        !!letsEncryptPluginConfigurationEmail) && (
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
  ) : null
}

export default Step3
