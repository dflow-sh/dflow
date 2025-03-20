'use client'

import { CircleCheck } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'

import { installPluginAction, syncPluginAction } from '@/actions/plugin'
import Loader from '@/components/Loader'
import { pluginList } from '@/components/plugins'
import { ServerType } from '@/payload-types-overrides'

import { useInstallationStep } from './InstallationStepContext'

const Step3 = ({ server }: { server: ServerType }) => {
  const [skipPluginsSync, setSkipPluginsSync] = useState(false)
  const { step, setStep } = useInstallationStep()
  const { execute: installPlugin, hasSucceeded: triggedInstallingPlugin } =
    useAction(installPluginAction, {
      onSuccess: ({ data }) => {
        if (data?.success) {
          setStep(4)
        }
      },
    })

  const plugins = server.plugins ?? []
  const letsEncryptPluginInstalled = plugins.find(
    plugin => plugin.name === 'letsencrypt',
  )
  const {
    execute: syncPlugins,
    isPending: isSyncingPlugins,
    hasSucceeded: syncedPlugins,
  } = useAction(syncPluginAction, {
    onSuccess: ({ data }) => {
      const plugins = data?.plugins ?? []

      if (plugins) {
        // check for letsencrypt plugin
        const letsEncryptPluginInstalled = plugins.filter(
          plugin => plugin.name === 'letsencrypt',
        )[0]

        if (!letsEncryptPluginInstalled) {
          installPlugin({
            pluginName: 'letsencrypt',
            serverId: server.id,
            pluginURL:
              pluginList.find(plugin => plugin.value === 'letsencrypt')
                ?.githubURL ?? '',
          })
        } else {
          setStep(4)
        }
      }
    },
  })

  useEffect(() => {
    if (step === 3) {
      syncPlugins({ serverId: server.id })

      if (letsEncryptPluginInstalled) {
        setSkipPluginsSync(true)
        setStep(4)
      }
    }
  }, [step, server])

  if (step < 3) {
    return null
  }

  return (
    <div className='space-y-2'>
      {isSyncingPlugins && (
        <div className='flex items-center gap-2'>
          <Loader className='h-max w-max' /> Syncing plugins...
        </div>
      )}

      {(syncedPlugins || skipPluginsSync) && (server.plugins ?? []).length && (
        <div className='flex items-center gap-2'>
          <CircleCheck size={24} className='text-primary' />
          {`${(server.plugins ?? []).length} Synced plugins!`}
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
