'use client'

import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { completeServerOnboardingAction } from '@/actions/server'
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
  const serverOnboardingContext = useServerOnboarding()

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
          serverOnboardingContext?.nextStep()
        } else {
          router.push(`/onboarding/configure-domain?server=${server.id}`)
        }
      },
    })
  }

  const { execute: updateServer, hasSucceeded: updatedServer } = useAction(
    completeServerOnboardingAction,
    {
      onExecute: () => {
        toast.loading('Marking server as onboarded...', {
          id: 'server-onboarding',
        })
      },
      onSettled: () => {
        toast.dismiss('server-onboarding')
      },
    },
  )

  useEffect(() => {
    if ('name' in pluginDetails && dokkuInstallationStep === 5) {
      const letsencryptConfiguration =
        pluginDetails.configuration &&
        typeof pluginDetails.configuration === 'object' &&
        !Array.isArray(pluginDetails.configuration) &&
        pluginDetails.configuration.email

      if (!!letsencryptConfiguration) {
        // if server is not onboarded and we're not in server-onboarding page skipping updating server onboarding status
        if (!server?.onboarded && !isServerOnboarding) {
          updateServer({
            serverId: server.id,
          })
        } else {
          if (!updatedServer) {
            redirectToNextStep()
          }
        }
      }
    }
  }, [server, dokkuInstallationStep])

  useEffect(() => {
    if (updatedServer) {
      redirectToNextStep()
    }
  }, [updatedServer])

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
