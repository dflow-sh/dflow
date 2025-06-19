import { CircleCheck, TriangleAlert } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { installDokkuAction } from '@/actions/server'
import Loader from '@/components/Loader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { supportedDokkuVersion, supportedLinuxVersions } from '@/lib/constants'
import { ServerType } from '@/payload-types-overrides'

import { useDokkuInstallationStep } from './DokkuInstallationStepContext'

const Step2 = ({ server }: { server: ServerType }) => {
  const [outdatedDokku, setOutdatedDokku] = useState(false)
  const installationAttemptedRef = useRef<string | null>(null)
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
      // Mark as attempted for this server
      installationAttemptedRef.current = input.serverId
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

  // Reset attempt tracking when server changes or step resets
  useEffect(() => {
    if (
      dokkuInstallationStep !== 2 ||
      installationAttemptedRef.current !== server?.id
    ) {
      installationAttemptedRef.current = null
    }
  }, [dokkuInstallationStep, server?.id])

  useEffect(() => {
    if (dokkuInstallationStep === 2 && server && !isInstallingDokku) {
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
        installationAttemptedRef.current !== server.id
      ) {
        installDokku({ serverId: server.id })
      }
    }
  }, [
    server,
    dokkuInstallationStep,
    isInstallingDokku,
    installDokku,
    setDokkuInstallationStep,
  ])

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
              rel='noopener'
              className='text-foreground underline'>
              docs
            </a>
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  if (dokkuInstallationStep < 2) {
    return null
  }

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
