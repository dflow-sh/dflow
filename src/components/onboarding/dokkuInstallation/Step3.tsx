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
  const {
    execute: installPlugin,
    isPending: isInstallingPlugin,
    hasSucceeded: installedPlugin,
  } = useAction(installPluginAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        setStep(4)
      }
    },
  })

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
    const plugins = server.plugins ?? []
    const letsEncryptPluginInstalled = plugins.find(
      plugin => plugin.name === 'letsencrypt',
    )

    if (step === 3) {
      if (!plugins.length) {
        syncPlugins({ serverId: server.id })
      } else if (letsEncryptPluginInstalled && plugins.length) {
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

      {(syncedPlugins || skipPluginsSync) && (
        <div className='flex items-center gap-2'>
          <CircleCheck size={24} className='text-primary' />
          {`${(server.plugins ?? []).length} Synced plugins!`}
        </div>
      )}

      {isInstallingPlugin && (
        <div className='flex items-center gap-2'>
          <Loader className='h-max w-max' /> Installing letsencrypt plugin...
        </div>
      )}

      {installedPlugin && (
        <div className='flex items-center gap-2'>
          <CircleCheck size={24} className='text-primary' />
          Installed letsencrypt plugin
        </div>
      )}
    </div>
  )
}

export default Step3
