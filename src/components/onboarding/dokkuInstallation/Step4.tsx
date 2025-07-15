import { CircleCheck } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { installRailpackAction } from '@/actions/server'
import Loader from '@/components/Loader'
import { useServerOnboarding } from '@/components/servers/onboarding/ServerOnboardingContext'
import { ServerType } from '@/payload-types-overrides'

import { useDokkuInstallationStep } from './DokkuInstallationStepContext'

const Step4 = ({ server }: { server: ServerType }) => {
  const { dokkuInstallationStep } = useDokkuInstallationStep()
  const [skipRailpackInstall, setSkipRailpackInstall] = useState(false)
  const { execute, isPending, hasSucceeded } = useAction(installRailpackAction)
  const { setCurrentStep } = useServerOnboarding()

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
      } else if (!hasSucceeded && !isPending) {
        execute({ serverId: server.id })
      }
    }
  }, [dokkuInstallationStep, server])

  return (
    <div className='space-y-2'>
      {(isPending || hasSucceeded || skipRailpackInstall) && (
        <>
          {!railpackVersion || railpackVersion === 'not-installed' ? (
            <div className='flex items-center gap-2'>
              <Loader className='h-max w-max' /> Installing Build tools...
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <CircleCheck size={24} className='text-primary' />
              Installed Builder tools
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Step4
