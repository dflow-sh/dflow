'use client'

import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { pluginList } from '@/components/plugins'
import { LetsencryptForm } from '@/components/servers/PluginConfigurationForm'
import { useServerOnboarding } from '@/components/servers/onboarding/ServerOnboardingContext'
import { ServerType } from '@/payload-types-overrides'

import { useDokkuInstallationStep } from './DokkuInstallationStepContext'

const Step5 = ({
  server,
  isServerOnboarding = false,
}: {
  server: ServerType
  isServerOnboarding?: boolean
}) => {
  const [selectedServer] = useQueryState('server')
  const { dokkuInstallationStep } = useDokkuInstallationStep()
  const serverOnboardingContext = function useSafeServerOnboarding() {
    try {
      return useServerOnboarding()
    } catch (e) {
      return null
    }
  }
  const router = useRouter()

  const plugins = server?.plugins ?? []
  const letsencryptPluginDetails = plugins.find(
    plugin => plugin.name === 'letsencrypt',
  )

  const plugin = pluginList.filter(plugin => plugin.value === 'letsencrypt')[0]
  const pluginDetails = letsencryptPluginDetails ?? plugin

  useEffect(() => {
    if ('name' in pluginDetails && dokkuInstallationStep === 5) {
      const letsencryptConfiguration =
        pluginDetails.configuration &&
        typeof pluginDetails.configuration === 'object' &&
        !Array.isArray(pluginDetails.configuration) &&
        pluginDetails.configuration.email

      if (!!letsencryptConfiguration && !!selectedServer) {
        toast.info('Setup is done', {
          description: 'Redirecting to next step...',
          action: {
            label: 'Cancel',
            onClick: () => {},
          },
          duration: 3000,
          onAutoClose: () => {
            if (isServerOnboarding) {
              serverOnboardingContext()?.nextStep()
            } else {
              router.push(
                `/onboarding/configure-domain?server=${selectedServer}`,
              )
            }
          },
        })
      }
    }
  }, [server, selectedServer, dokkuInstallationStep])

  return (
    <LetsencryptForm
      plugin={letsencryptPluginDetails ?? plugin}
      serverId={server?.id}
      key={JSON.stringify(pluginDetails)}
    />
  )
}

export default Step5
