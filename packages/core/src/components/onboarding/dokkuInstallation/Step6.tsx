import { CircleCheck } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { serverBackupAction } from '@/actions/backups'
import Loader from '@/components/Loader'
import { useServerOnboarding } from '@/components/servers/onboarding/ServerOnboardingContext'
import { ServerType } from '@/payload-types-overrides'

import { useDokkuInstallationStep } from "@core/components/onboarding/dokkuInstallation/DokkuInstallationStepContext"

const Step6 = ({ server }: { server: ServerType }) => {
  const {
    dokkuInstallationStep,
    backupToolsInstalled,
    setBackupToolsInstalled,
  } = useDokkuInstallationStep()
  const { setCurrentStep } = useServerOnboarding()

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

  const { execute, isPending, hasSucceeded } = useAction(serverBackupAction, {
    onError: ({ error }) => {
      toast.error(`Failed to install backup tools: ${error?.serverError}`)
    },
    onSuccess: ({ data }) => {
      if (data?.installation) {
        setBackupToolsInstalled(true)
      }

      toast.info(data?.message)
      redirectToNextStep()
    },
  })

  useEffect(() => {
    if (dokkuInstallationStep <= 5) {
      return
    }

    if (isPending || hasSucceeded) {
      return
    }

    execute({ serverId: server.id })
  }, [dokkuInstallationStep])

  if (dokkuInstallationStep <= 5) {
    return null
  }

  return (
    <div className='space-y-2'>
      {(isPending || hasSucceeded || backupToolsInstalled) && (
        <>
          {backupToolsInstalled ? (
            <div className='flex items-center gap-2'>
              <CircleCheck size={24} className='text-primary' />
              Installed Backup tools
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Loader className='h-max w-max' /> Installing Backup tools...
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Step6
