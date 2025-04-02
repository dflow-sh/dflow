'use client'

import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { pluginList } from '@/components/plugins'
import { LetsencryptForm } from '@/components/servers/PluginConfigurationForm'
import { ServerType } from '@/payload-types-overrides'

import { useInstallationStep } from './InstallationStepContext'

const Step5 = ({ server }: { server: ServerType }) => {
  const [selectedServer] = useQueryState('server')
  const { step } = useInstallationStep()
  const router = useRouter()

  const plugins = server?.plugins ?? []
  const letsencryptPluginDetails = plugins.find(
    plugin => plugin.name === 'letsencrypt',
  )

  const plugin = pluginList.filter(plugin => plugin.value === 'letsencrypt')[0]
  const pluginDetails = letsencryptPluginDetails ?? plugin

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if ('name' in pluginDetails && step === 5) {
      const letsencryptConfiguration =
        pluginDetails.configuration &&
        typeof pluginDetails.configuration === 'object' &&
        !Array.isArray(pluginDetails.configuration) &&
        pluginDetails.configuration.email

      if (!!letsencryptConfiguration && !!selectedServer) {
        timeout = setTimeout(() => {
          router.push(`/onboarding/configure-domain?server=${selectedServer}`)
        }, 8000)

        toast.info('Dokku installation is done', {
          description: "You'll be redirected in few seconds to next step",
          action: {
            label: 'Cancel',
            onClick: () => clearTimeout(timeout),
          },
          duration: 5000,
        })
      }
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [server, selectedServer, step])

  return (
    <LetsencryptForm
      plugin={letsencryptPluginDetails ?? plugin}
      serverId={server?.id}
      key={JSON.stringify(pluginDetails)}
    />
  )
}

export default Step5
