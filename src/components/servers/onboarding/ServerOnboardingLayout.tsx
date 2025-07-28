'use client'

import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

import {
  completeServerOnboardingAction,
  syncServerDomainAction,
} from '@/actions/server'
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
  const router = useRouter()
  const { organisation } = useParams<{ organisation: string }>()

  const isLastStep = currentStep === totalSteps

  const {
    execute: syncDomain,
    isPending: syncingDomains,
    hasSucceeded: triggeredDomainsSync,
  } = useAction(syncServerDomainAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.loading('Syncing domains, please wait...', {
          id: 'complete-server',
        })
      }
    },
    onError: ({ error, input }) => {
      toast.error(`Failed to sync domain: ${error.serverError}`)
    },
  })

  const { execute: executeCompleteOnboarding, isPending: isOnboardingSerer } =
    useAction(completeServerOnboardingAction, {
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

  useEffect(() => {
    // Check if domain is configured
    const isDomainConfigured = (server.domains ?? []).some(
      domain => domain.synced,
    )

    if (triggeredDomainsSync && isDomainConfigured) {
      executeCompleteOnboarding({ serverId: server.id })
    }
  }, [server, triggeredDomainsSync])

  const handleSyncDomains = () => {
    const unsyncedDomains = (server?.domains ?? [])
      .filter(({ synced }) => !synced)
      .map(({ domain }) => domain)

    syncDomain({
      domains: unsyncedDomains,
      id: server.id,
      operation: 'add',
    })
  }

  return (
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
          size={currentStep === 1 ? 'icon' : 'default'}
          onClick={() => {
            previousStep()
          }}
          disabled={currentStep === 1}>
          <ChevronLeft size={24} />
          {currentStep !== 1 && 'Prev'}
        </Button>

        <div className='flex-1' />
        {isLastStep ? (
          <>
            <Button
              variant='outline'
              isLoading={syncingDomains}
              disabled={
                syncingDomains ||
                triggeredDomainsSync ||
                isOnboardingSerer ||
                !(server?.domains ?? []).length
              }
              className='mr-2'
              onClick={() => {
                handleSyncDomains()
              }}>
              <Check /> Complete Setup
            </Button>
          </>
        ) : (
          <Button
            variant={'outline'}
            size={disableNextStep ? 'icon' : 'default'}
            onClick={nextStep}
            disabled={disableNextStep}>
            {disableNextStep ? '' : 'Next'}
            <ChevronRight size={24} />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default ServerOnboardingLayout
