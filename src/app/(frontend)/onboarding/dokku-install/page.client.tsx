'use client'

import { HardDrive, Lock, Plug2 } from 'lucide-react'
import { useMemo } from 'react'

import TimeLineComponent, {
  TimeLineComponentType,
} from '@/components/TimeLineComponent'
import { Dokku } from '@/components/icons'
import { useInstallationStep } from '@/components/onboarding/dokkuInstallation/InstallationStepContext'
import Step1 from '@/components/onboarding/dokkuInstallation/Step1'
import Step2 from '@/components/onboarding/dokkuInstallation/Step2'
import Step3 from '@/components/onboarding/dokkuInstallation/Step3'
import Step4 from '@/components/onboarding/dokkuInstallation/Step4'
import { ServerType } from '@/payload-types-overrides'

export const ClientPage = ({ servers }: { servers: ServerType[] }) => {
  const { step, setStep } = useInstallationStep()

  const list = useMemo<TimeLineComponentType[]>(() => {
    return [
      {
        title: 'Select a Server',
        description: 'Select a server for dokku installation',
        content: <Step1 servers={servers as ServerType[]} />,
        icon: <HardDrive size={16} />,
        highlighted: step > 1,
      },
      {
        title: 'Dokku Installation',
        description: 'Installing dokku for deployment management',
        content: <Step2 />,
        icon: <Dokku fontSize={16} />,
        disabled: step < 2,
        highlighted: step > 2,
      },
      {
        title: 'Plugin Configuration',
        description: 'Installing dokku plugins required for deployment',
        content: <Step3 server={servers[0] as ServerType} />,
        icon: <Plug2 size={20} />,
        disabled: step < 3,
        highlighted: step > 3,
      },
      {
        title: 'SSL Configuration',
        description:
          'Add a global email configuration, for SSL certificate generation',
        content: <Step4 server={servers[0] as ServerType} />,
        icon: <Lock size={16} />,
        disabled: step < 4,
      },
    ]
  }, [servers, step, setStep])

  return <TimeLineComponent list={list} />
}
