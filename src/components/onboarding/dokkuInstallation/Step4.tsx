import { CircleCheck } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { installRailpackAction } from '@/actions/server'
import Loader from '@/components/Loader'
import { useServerOnboarding } from '@/components/servers/onboarding/ServerOnboardingContext'
import { ServerType } from '@/payload-types-overrides'

import { useDokkuInstallationStep } from './DokkuInstallationStepContext'

const Step4 = ({ server }: { server: ServerType }) => {
  const { dokkuInstallationStep, setDokkuInstallationStep } =
    useDokkuInstallationStep()
  const [skipRailpackInstall, setSkipRailpackInstall] = useState(false)
  const { execute, isPending, hasSucceeded } = useAction(installRailpackAction)
  const { setCurrentStep } = useServerOnboarding()
  const router = useRouter()

  const railpackVersion = server?.railpack

  const redirectToNextStep = () => {
    toast.info('Setup is done', {
      description: 'Redirecting to next step...',
      action: {
        label: 'Cancel',
        onClick: () => {},
      },
      duration: 3000,
      onAutoClose: () => {
        setCurrentStep(2)
      },
    })
  }

  useEffect(() => {
    if (dokkuInstallationStep === 4) {
      if (railpackVersion && railpackVersion !== 'not-installed') {
        setSkipRailpackInstall(true)
        redirectToNextStep()
      } else {
        execute({ serverId: server.id })
      }
    }
  }, [dokkuInstallationStep, server, railpackVersion, execute, setCurrentStep])

  return (
    <div className='space-y-2'>
      {skipRailpackInstall && (
        <div className='flex items-center gap-2'>
          <CircleCheck size={24} className='text-primary' />
          Builder installed
        </div>
      )}

      {(isPending || hasSucceeded) &&
        (!railpackVersion || railpackVersion === 'not-installed') && (
          <div className='flex items-center gap-2'>
            <Loader className='h-max w-max' /> Installing Builder...
          </div>
        )}
    </div>
  )
}

export default Step4
