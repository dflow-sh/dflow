'use client'

import { Hammer, HardDrive, Lock, Plug2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'

import TimeLineComponent, {
  TimeLineComponentType,
} from '@/components/TimeLineComponent'
import { Dokku } from '@/components/icons'
import { useDokkuInstallationStep } from '@/components/onboarding/dokkuInstallation/DokkuInstallationStepContext'
import Step1 from '@/components/onboarding/dokkuInstallation/Step1'
import Step2 from '@/components/onboarding/dokkuInstallation/Step2'
import Step3 from '@/components/onboarding/dokkuInstallation/Step3'
import Step4 from '@/components/onboarding/dokkuInstallation/Step4'
import Step5 from '@/components/onboarding/dokkuInstallation/Step5'
import { ServerType } from '@/payload-types-overrides'

import ServerOnboardingLayout from './ServerOnboardingLayout'

const DokkuInstallation = ({ server }: { server: ServerType }) => {
  const { dokkuInstallationStep, setDokkuInstallationStep } =
    useDokkuInstallationStep()

  // component unmount resetting the form state
  useEffect(() => {
    return () => {
      setDokkuInstallationStep(2)
    }
  }, [])

  const list = useMemo<TimeLineComponentType[]>(() => {
    return [
      {
        title: 'Select a Server',
        description: 'Select a server for dokku installation',
        content: <Step1 servers={[server] as ServerType[]} />,
        icon: <HardDrive size={16} />,
        highlighted: dokkuInstallationStep > 1,
      },
      {
        title: 'Dokku Installation',
        description: 'Installing dokku for deployment management',
        content: (
          <Step2 server={dokkuInstallationStep >= 2 ? server : undefined} />
        ),
        icon: <Dokku fontSize={16} />,
        disabled: dokkuInstallationStep < 2,
        highlighted: dokkuInstallationStep > 2,
      },
      {
        title: 'Plugin Configuration',
        description: 'Installing dokku plugins required for deployment',
        content: <Step3 server={server} />,
        icon: <Plug2 size={20} />,
        disabled: dokkuInstallationStep < 3,
        highlighted: dokkuInstallationStep > 3,
      },
      {
        title: 'Builder Installation',
        description: 'Installing build-tool required for deployment',
        content: <Step4 server={server} />,
        icon: <Hammer size={20} />,
        disabled: dokkuInstallationStep < 4,
        highlighted: dokkuInstallationStep > 4,
      },
      {
        title: 'SSL Configuration',
        description:
          'Add a global email configuration, for SSL certificate generation',
        content: <Step5 server={server} isServerOnboarding />,
        icon: <Lock size={16} />,
        disabled: dokkuInstallationStep < 5,
      },
    ]
  }, [dokkuInstallationStep, setDokkuInstallationStep, server])

  const installationDone =
    !!server && !!server.version && server.version !== 'not-installed'

  const pluginsInstalled = (server?.plugins ?? []).find(
    plugin => plugin.name === 'letsencrypt',
  )

  const emailConfirmationDone =
    pluginsInstalled &&
    pluginsInstalled.configuration &&
    typeof pluginsInstalled.configuration === 'object' &&
    !Array.isArray(pluginsInstalled.configuration) &&
    pluginsInstalled.configuration.email

  const isComplete =
    installationDone && !!pluginsInstalled && Boolean(emailConfirmationDone)

  return (
    <ServerOnboardingLayout
      server={server}
      cardTitle={'Dokku & Tools Installation'}
      disableNextStep={isComplete}>
      <TimeLineComponent list={list} />
    </ServerOnboardingLayout>
  )
}

export default DokkuInstallation
