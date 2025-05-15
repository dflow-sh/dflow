'use client'

import { CheckCircle, ChevronLeft, ChevronRight, Server } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams, useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { toast } from 'sonner'

import { completeServerOnboardingAction } from '@/actions/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ServerType } from '@/payload-types-overrides'

import { useServerOnboarding } from './ServerOnboardingContext'

const ServerOnboardingLayout = ({
  server,
  cardTitle,
  cardDescription = '',
  disableNextStep,
  children,
}: {
  server: ServerType
  cardTitle: string
  cardDescription?: string
  disableNextStep: boolean
  children?: React.ReactNode
}) => {
  const { currentStep, totalSteps, nextStep, previousStep } =
    useServerOnboarding()
  const [_selectedServer, setSelectedServer] = useQueryState('server')
  const router = useRouter()
  const { organisation } = useParams<{ organisation: string }>()

  const isLastStep = currentStep === totalSteps

  // Check if Dokku is properly installed
  const installationDone =
    !!server && !!server.version && server.version !== 'not-installed'

  // Check if Let's Encrypt plugin is installed and configured
  const pluginsInstalled = (server?.plugins ?? []).find(
    plugin => plugin.name === 'letsencrypt',
  )

  const emailConfirmationDone =
    pluginsInstalled &&
    pluginsInstalled.configuration &&
    typeof pluginsInstalled.configuration === 'object' &&
    !Array.isArray(pluginsInstalled.configuration) &&
    pluginsInstalled.configuration.email

  // Check if domain is configured
  const isDomainConfigured = (server.domains ?? []).some(
    domain => domain.synced,
  )

  // Only enable completion when all required steps are complete
  const isFullyComplete =
    installationDone &&
    !!pluginsInstalled &&
    Boolean(emailConfirmationDone) &&
    isDomainConfigured

  const { execute, isPending } = useAction(completeServerOnboardingAction, {
    onExecute: () => {
      toast.loading('Completing server setup...', { id: 'complete-server' })
    },
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success('Server setup completed successfully', {
          id: 'complete-server',
        })
        // Navigate to the server dashboard
        router.push(`/${organisation}/servers/${server.id}`)
      } else {
        toast.error('Failed to complete server setup', {
          id: 'complete-server',
        })
      }
    },
    onError: ({ error }) => {
      toast.error(
        `Error completing server setup: ${error.serverError || 'Unknown error'}`,
        {
          id: 'complete-server',
        },
      )
    },
  })

  const handleComplete = () => {
    execute({ serverId: server.id })
  }

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-4'>
      <div className='flex w-full items-center justify-start gap-2 text-2xl font-semibold'>
        <Server />
        <p>{server.name} - Onboarding</p>
      </div>

      <Card className='w-full'>
        <CardHeader>
          <div className='flex items-center gap-2 text-sm font-extralight tracking-wide text-foreground'>
            <div>
              STEP <span className='font-medium'>{currentStep}</span> OF{' '}
              <span className='font-medium'>{totalSteps}</span>
            </div>
          </div>
          <div className='mt-1.5 text-3xl font-semibold tracking-wide'>
            {cardTitle}
          </div>
          <div className='text-sm text-muted-foreground'>{cardDescription}</div>
        </CardHeader>

        <CardContent>{children}</CardContent>

        <CardFooter className='mt-4 flex justify-between border-t pt-4'>
          <Button
            variant={'outline'}
            size={'icon'}
            onClick={() => {
              setSelectedServer('')
              previousStep()
            }}
            disabled={currentStep === 1}>
            <ChevronLeft size={24} />
          </Button>

          <div className='flex-1' />

          {isLastStep ? (
            <Button
              variant={'default'}
              className='flex items-center gap-2'
              onClick={handleComplete}
              disabled={!isFullyComplete || isPending}>
              {isPending ? (
                'Processing...'
              ) : (
                <>
                  <CheckCircle size={18} />
                  Complete Setup
                </>
              )}
            </Button>
          ) : (
            <Button
              variant={'outline'}
              size={'icon'}
              onClick={nextStep}
              disabled={!disableNextStep || currentStep === totalSteps}>
              <ChevronRight size={24} />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default ServerOnboardingLayout
