import { CircleCheck } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useQueryState } from 'nuqs'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { installDokkuAction } from '@/actions/server'
import Loader from '@/components/Loader'
import { supportedLinuxVersions } from '@/lib/constants'
import { ServerType } from '@/payload-types-overrides'

import { useInstallationStep } from './InstallationStepContext'

const Step2 = ({ server }: { server: ServerType | undefined }) => {
  const [selectedServer] = useQueryState('server')
  const { setStep, step } = useInstallationStep()

  const {
    execute: installDokku,
    isPending: isInstallingDokku,
    hasSucceeded,
  } = useAction(installDokkuAction, {
    onExecute: ({ input }) => {
      toast.loading('Adding dokku installation to queue', {
        id: input.serverId,
      })
    },
    onSuccess: ({ data, input }) => {
      if (data?.success) {
        toast.info('Added to queue', {
          description: 'Added dokku installation to queue',
          id: input.serverId,
        })
      }
    },
  })

  useEffect(() => {
    if (selectedServer && step === 2 && server) {
      if (server.version && server.version !== 'not-installed') {
        return setStep(3)
      }

      if (
        server.portIsOpen &&
        server.sshConnected &&
        supportedLinuxVersions.includes(server.os.version ?? '')
      ) {
        installDokku({ serverId: selectedServer })
      }
    }
  }, [selectedServer, server, step])

  return (
    <div className='space-y-2'>
      {(isInstallingDokku || hasSucceeded) &&
        (server?.version === 'not-installed' || !server?.version) && (
          <div className='flex items-center gap-2'>
            <Loader className='h-max w-max' /> Installing dokku, open terminal
            to check logs
          </div>
        )}

      {server?.version && server?.version !== 'not-installed' && (
        <div className='flex items-center gap-2'>
          <CircleCheck size={24} className='text-primary' />
          {hasSucceeded
            ? `Installed dokku: v${server?.version}`
            : `Skipping dokku installation: found dokku v${server?.version}`}
        </div>
      )}
    </div>
  )
}

export default Step2
