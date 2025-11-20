'use client'

import { CircleCheck } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { toast } from 'sonner'

import {
  installAndConfigureLetsencryptPluginAction,
  syncPluginAction,
} from '@/actions/plugin'
import Loader from '@/components/Loader'
import { ServerType } from '@/payload-types-overrides'

import { useDokkuInstallationStep } from './DokkuInstallationStepContext'

const Step3 = ({ server }: { server: ServerType }) => {
  const { dokkuInstallationStep, setDokkuInstallationStep } =
    useDokkuInstallationStep()

  const {
    execute: installPlugin,
    hasSucceeded: triggedInstallingPlugin,
    isPending: triggeringInstallingPlugin,
  } = useAction(installAndConfigureLetsencryptPluginAction, {
    onError: ({ error }) => {
      toast.error(
        `Failed to trigger letsencrypt configuration: ${error.serverError}`,
      )
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

  const handlePluginsSync = async () => {
    // syncing plugins
    await syncPlugins({ serverId: server.id })

    installPlugin({
      serverId: server?.id,
    })
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
      if (!letsEncryptPluginInstalled || !letsEncryptPluginConfigurationEmail) {
        handlePluginsSync()
        return
      }

      if (letsEncryptPluginConfigurationEmail) {
        setDokkuInstallationStep(4)
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
          {letsEncryptPluginInstalled && letsEncryptPluginConfigurationEmail ? (
            <>
              <CircleCheck size={24} className='text-primary' />
              Installed letsencrypt plugin and configured global email
            </>
          ) : (
            <>
              <Loader className='h-max w-max' />
              Installing letsencrypt plugin & configuring global email...
            </>
          )}
        </div>
      )}
    </div>
  ) : null
}

export default Step3
