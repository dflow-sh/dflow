'use client'

import { Activity, CloudUpload, Hammer, HardDrive, Plug2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useMemo } from 'react'

import { getUserAction } from '@dflow/core/actions/auth'
import TimeLineComponent, {
  TimeLineComponentType,
} from '@dflow/core/components/TimeLineComponent'
import { Dokku } from '@dflow/core/components/icons'
import { useDokkuInstallationStep } from '@dflow/core/components/onboarding/dokkuInstallation/DokkuInstallationStepContext'
import Step1 from '@dflow/core/components/onboarding/dokkuInstallation/Step1'
import Step2 from '@dflow/core/components/onboarding/dokkuInstallation/Step2'
import Step3 from '@dflow/core/components/onboarding/dokkuInstallation/Step3'
import Step4 from '@dflow/core/components/onboarding/dokkuInstallation/Step4'
import Step5 from '@dflow/core/components/onboarding/dokkuInstallation/Step5'
import Step6 from '@dflow/core/components/onboarding/dokkuInstallation/Step6'
import { ServerType } from '@dflow/core/payload-types-overrides'

import ServerOnboardingLayout from './ServerOnboardingLayout'

const ServerSetup = ({
  server,
  s3Enabled,
}: {
  server: ServerType
  s3Enabled: boolean
}) => {
  const { dokkuInstallationStep, isDokkuInstallationStepsComplete } =
    useDokkuInstallationStep()

  const {
    execute: getUser,
    result: { data: user },
  } = useAction(getUserAction)

  useEffect(() => {
    getUser()
  }, [])

  const list = useMemo<TimeLineComponentType[]>(() => {
    return [
      {
        title: 'Server Preparation',
        description: `Preparing ${server.name || 'your server'} for setup`,
        content: <Step1 server={server as ServerType} />,
        icon: <HardDrive size={16} />,
        highlighted: dokkuInstallationStep > 1,
      },
      {
        title: 'Dokku Installation',
        description: `Installing Dokku PaaS platform on ${server.provider === 'aws' ? 'EC2 instance' : 'server'}`,
        content: <Step2 server={server} />,
        icon: <Dokku fontSize={16} />,
        disabled: dokkuInstallationStep < 2,
        highlighted: dokkuInstallationStep > 2,
      },
      {
        title: 'Essential Plugins',
        description: 'Installing required plugins for seamless app deployment',
        content: <Step3 server={server} />,
        icon: <Plug2 size={20} />,
        disabled: dokkuInstallationStep < 3,
        highlighted: dokkuInstallationStep > 3,
      },
      {
        title: 'Monitoring Tools',
        description: 'Setting up monitoring and observability tools',
        content: <Step4 server={server} />,
        icon: <Activity size={20} />,
        disabled: dokkuInstallationStep < 4,
        highlighted: dokkuInstallationStep > 4,
      },
      {
        title: 'Build Tools',
        description:
          'Configuring build environment for application deployments',
        content: <Step5 server={server} s3Enabled={s3Enabled} />,
        icon: <Hammer size={20} />,
        disabled: dokkuInstallationStep < 5,
        highlighted: dokkuInstallationStep > 5,
      },
      s3Enabled
        ? {
            title: 'Backup Tools',
            description: 'Setting up backup tools',
            content: <Step6 server={server} />,
            icon: <CloudUpload size={20} />,
            disabled: dokkuInstallationStep < 6,
          }
        : null,
    ].filter(Boolean) as TimeLineComponentType[]
  }, [dokkuInstallationStep, server, s3Enabled])

  // Check if Dokku is properly installed on this server
  const installationDone =
    !!server && !!server.version && server.version !== 'not-installed'

  // Check if required plugins are installed on this server
  const pluginsInstalled = (server?.plugins ?? []).find(
    plugin => plugin.name === 'letsencrypt',
  )

  // Check if monitoring tools are installed
  const monitoringInstalled = (server?.plugins ?? []).find(
    plugin => plugin.name === 'monitoring',
  )

  // Check if SSL email configuration is completed for this server
  const emailConfirmationDone =
    pluginsInstalled &&
    pluginsInstalled.configuration &&
    typeof pluginsInstalled.configuration === 'object' &&
    !Array.isArray(pluginsInstalled.configuration) &&
    pluginsInstalled.configuration.email

  // Server setup is complete when all components are properly configured
  const isServerSetupComplete =
    installationDone &&
    Boolean(pluginsInstalled) &&
    Boolean(monitoringInstalled) &&
    Boolean(emailConfirmationDone)

  const getCardTitle = () => {
    const serverIdentifier =
      server.name || `${server.provider?.toUpperCase()} Server`
    return `Setting up ${serverIdentifier} for Deployment`
  }

  return (
    <ServerOnboardingLayout
      server={server}
      cardTitle={getCardTitle()}
      disableNextStep={
        !isServerSetupComplete || !isDokkuInstallationStepsComplete
      }>
      <TimeLineComponent list={list} />
    </ServerOnboardingLayout>
  )
}

export default ServerSetup
