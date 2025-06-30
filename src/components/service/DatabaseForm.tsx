'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { exposeDatabasePortAction } from '@/actions/service'
import { Server, Service } from '@/payload-types'

const DatabaseForm = ({
  service,
  server,
}: {
  service: Service
  server: Server | string
}) => {
  const { databaseDetails } = service
  const isPublic = !!databaseDetails?.exposedPorts?.length
  const connectionUrl = databaseDetails?.connectionUrl ?? ''
  const host = databaseDetails?.host ?? ''
  const port = databaseDetails?.port ?? ''
  const exposedPort = databaseDetails?.exposedPorts?.[0] ?? ''
  const deployments = service.deployments?.docs ?? []
  const hasDeployed = deployments?.some(
    deployment =>
      typeof deployment === 'object' && deployment.status === 'success',
  )

  const { execute, isPending, hasSucceeded, reset, input } = useAction(
    exposeDatabasePortAction,
    {
      onSuccess: ({ data, input }) => {
        if (data?.success) {
          toast.info('Added to queue', {
            description: `Added ${input.action === 'expose' ? 'database exposure' : 'un-exposing database'} to queue`,
          })
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to expose port: ${error.serverError}`, {
          duration: 5000,
        })
      },
    },
  )

  useEffect(() => {
    if (hasSucceeded) {
      const ports = databaseDetails?.exposedPorts
      const action = input?.action

      if (action === 'expose' && !!ports?.length) {
        reset()
      } else if (action === 'unexpose' && !ports?.length) {
        reset()
      }
    }
  }, [hasSucceeded, service, input])

  const publicUrl =
    isPublic && typeof server === 'object'
      ? connectionUrl
          .replace(
            host,
            server.preferConnectionType === 'ssh'
              ? (server.ip ?? '')
              : (server.tailscale?.addresses?.at(0) ?? ''),
          )
          .replace(port, exposedPort)
      : ''

  return (
    <>
      <div className='space-y-4 rounded bg-muted/30 p-4'>
        <h3 className='text-lg font-semibold'>Internal Credentials</h3>

        <form className='w-full space-y-6'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Username</Label>
              <Input disabled value={databaseDetails?.username ?? '-'} />
            </div>

            <div className='space-y-2'>
              <Label>Password</Label>
              <Input disabled value={databaseDetails?.password ?? '-'} />
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Port</Label>
              <Input disabled value={databaseDetails?.port ?? '-'} />
            </div>

            <div className='space-y-2'>
              <Label>Host</Label>
              <Input disabled value={databaseDetails?.host ?? '-'} />
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Internal connection url</Label>
              <Input disabled value={databaseDetails?.connectionUrl ?? '-'} />
            </div>

            <div className='space-y-2'>
              <Label>Public connection url</Label>

              <div className='flex gap-2'>
                <Input disabled value={isPublic ? publicUrl : '-'} />

                {hasDeployed && (
                  <Button
                    variant='outline'
                    disabled={isPending || hasSucceeded}
                    isLoading={isPending}
                    onClick={() => {
                      execute({
                        action: isPublic ? 'unexpose' : 'expose',
                        id: service.id,
                      })
                    }}>
                    {isPublic
                      ? input?.action === 'unexpose'
                        ? 'Un-exposing'
                        : 'Unexpose'
                      : input?.action === 'expose'
                        ? 'Exposing'
                        : 'Expose'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

export default DatabaseForm
