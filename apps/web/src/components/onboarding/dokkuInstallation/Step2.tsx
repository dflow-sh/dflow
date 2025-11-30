import { CircleCheck, TriangleAlert } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { installDokkuAction } from '@/actions/server'
import Loader from '@/components/Loader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { supportedDokkuVersion, supportedLinuxVersions } from '@/lib/constants'
import { ServerType } from '@/payload-types-overrides'

import { useDokkuInstallationStep } from './DokkuInstallationStepContext'

const Step2 = ({ server }: { server: ServerType }) => {
  const [outdatedDokku, setOutdatedDokku] = useState(false)
  const { setDokkuInstallationStep, dokkuInstallationStep } =
    useDokkuInstallationStep()

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
    onError: ({ error }) => {
      toast.error(`Failed to install dokku: ${error?.serverError}`)
    },
  })

  useEffect(() => {
    if (dokkuInstallationStep === 2) {
      if (
        server.version &&
        server.version !== 'not-installed' &&
        server.version < supportedDokkuVersion
      ) {
        return setOutdatedDokku(true)
      }

      if (
        server.version &&
        server.version !== 'not-installed' &&
        server.version >= supportedDokkuVersion
      ) {
        return setDokkuInstallationStep(3)
      }

      // Check if we haven't already attempted installation for this server
      if (
        server.portIsOpen &&
        server.connection?.status === 'success' &&
        supportedLinuxVersions.includes(server.os.version ?? '') &&
        !hasSucceeded
      ) {
        installDokku({ serverId: server.id })
      }
    }
  }, [server, dokkuInstallationStep])

  if (outdatedDokku) {
    return (
      <Alert variant='warning'>
        <TriangleAlert className='h-4 w-4' />

        <AlertTitle>Upgrade dokku version!</AlertTitle>
        <AlertDescription className='flex w-full flex-col justify-between gap-2 md:flex-row'>
          <p>
            {` ${server?.version} is not supported! please upgrade ${supportedDokkuVersion} for more information check `}
            <a
              href='https://dokku.com/docs/getting-started/upgrading/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-foreground underline'>
              docs
            </a>
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  return dokkuInstallationStep >= 2 ? (
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
  ) : null
}

export default Step2
