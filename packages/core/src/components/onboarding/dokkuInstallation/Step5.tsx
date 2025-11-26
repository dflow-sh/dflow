import { CircleCheck } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { installRailpackAction } from "@core/actions/server"
import Loader from "@core/components/Loader"
import { useServerOnboarding } from "@core/components/servers/onboarding/ServerOnboardingContext"
import { ServerType } from "@core/payload-types-overrides"

import { useDokkuInstallationStep } from "@core/components/onboarding/dokkuInstallation/DokkuInstallationStepContext"

const Step5 = ({
  server,
  s3Enabled,
}: {
  server: ServerType
  s3Enabled: boolean
}) => {
  const { dokkuInstallationStep, setDokkuInstallationStep } =
    useDokkuInstallationStep()
  const { execute, isPending, hasSucceeded } = useAction(
    installRailpackAction,
    {
      onError: ({ error }) => {
        toast.error(`Failed to install railpack: ${error?.serverError}`)
      },
    },
  )
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
    if (dokkuInstallationStep === 5) {
      if (railpackVersion && railpackVersion !== 'not-installed') {
        if (!s3Enabled) {
          redirectToNextStep()
          return
        }

        setDokkuInstallationStep(6)
      } else if (!hasSucceeded && !isPending) {
        execute({ serverId: server.id })
      }
    }
  }, [dokkuInstallationStep, server, s3Enabled])

  return (
    <div className='space-y-2'>
      {(isPending || hasSucceeded) && (
        <>
          {!railpackVersion || railpackVersion === 'not-installed' ? (
            <div className='flex items-center gap-2'>
              <Loader className='h-max w-max' /> Installing Build tools...
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <CircleCheck size={24} className='text-primary' />
              Installed Build tools
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Step5
