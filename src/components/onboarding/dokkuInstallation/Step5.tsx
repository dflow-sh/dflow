'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { pluginList } from '@/components/plugins'
import { LetsencryptForm } from '@/components/servers/PluginConfigurationForm'
import { useServerOnboarding } from '@/components/servers/onboarding/ServerOnboardingContext'
import { User } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

import { useDokkuInstallationStep } from './DokkuInstallationStepContext'

const Step5 = ({
  server,
  isServerOnboarding = false,
  user,
}: {
  server: ServerType
  isServerOnboarding?: boolean
  user?: User
}) => {
  const { dokkuInstallationStep } = useDokkuInstallationStep()
  const { currentStep, setCurrentStep } = useServerOnboarding()

  const router = useRouter()
  const plugins = server?.plugins ?? []
  const letsencryptPluginDetails = plugins.find(
    plugin => plugin.name === 'letsencrypt',
  )

  const plugin = pluginList.filter(plugin => plugin.value === 'letsencrypt')[0]
  const pluginDetails = letsencryptPluginDetails ?? plugin

  const redirectToNextStep = () => {
    toast.info('Setup is done', {
      description: 'Redirecting to next step...',
      action: {
        label: 'Cancel',
        onClick: () => {},
      },
      duration: 3000,
      onAutoClose: () => {
        if (isServerOnboarding) {
          setCurrentStep(2)
        } else {
          router.push(`/onboarding/configure-domain?server=${server.id}`)
        }
      },
    })
  }

  useEffect(() => {
    if ('name' in pluginDetails && dokkuInstallationStep === 5) {
      const letsencryptConfiguration =
        pluginDetails.configuration &&
        typeof pluginDetails.configuration === 'object' &&
        !Array.isArray(pluginDetails.configuration) &&
        pluginDetails.configuration.email

      if (!!letsencryptConfiguration) {
        redirectToNextStep()
      }
    }
  }, [server, dokkuInstallationStep, currentStep])

  return (
    <LetsencryptForm
      plugin={letsencryptPluginDetails ?? plugin}
      serverId={server?.id}
      key={JSON.stringify({ ...pluginDetails, serverId: server?.id })}
      userEmail={user?.email}
    />
  )
}

export default Step5
