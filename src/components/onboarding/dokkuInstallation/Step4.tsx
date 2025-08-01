import { CircleCheck } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { installMonitoringToolsAction } from '@/actions/server'
import Loader from '@/components/Loader'
import { ServerType } from '@/payload-types-overrides'

import { useDokkuInstallationStep } from './DokkuInstallationStepContext'

const Step4 = ({ server }: { server: ServerType }) => {
  const { dokkuInstallationStep, setDokkuInstallationStep } =
    useDokkuInstallationStep()
  const [skipMonitoringInstall, setSkipMonitoringInstall] = useState(false)

  const { execute, isPending, hasSucceeded } = useAction(
    installMonitoringToolsAction,
    {
      onError: ({ error }) => {
        toast.error(`Failed to install monitoring tools: ${error?.serverError}`)
      },
      onSuccess: () => {
        setDokkuInstallationStep(5)
      },
    },
  )

  useEffect(() => {
    if (dokkuInstallationStep === 4) {
      if (hasSucceeded) {
        setSkipMonitoringInstall(true)
      } else if (!hasSucceeded && !isPending) {
        execute({ serverId: server.id })
      }
    }
  }, [dokkuInstallationStep, server, hasSucceeded])

  return (
    <div className='space-y-2'>
      {(isPending || hasSucceeded || skipMonitoringInstall) && (
        <>
          {!hasSucceeded ? (
            <div className='flex items-center gap-2'>
              <Loader className='h-max w-max' /> Installing monitoring tools...
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <CircleCheck size={24} className='text-primary' />
              Monitoring tools installed
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Step4
