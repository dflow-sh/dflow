'use client'

import AccessDeniedAlert from '../AccessDeniedAlert'
import { Link } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { parseAsString, useQueryState } from 'nuqs'
import { useEffect } from 'react'

import { getAllAppsAction } from '@dflow/core/actions/gitProviders'
import GithubIntegrationsLoading from '@dflow/core/components/Integrations/GithubIntegrationsLoading'
import CreateGitAppForm from '@dflow/core/components/gitProviders/CreateGitAppForm'
import GitProviderList from '@dflow/core/components/gitProviders/GitProviderList'
import { Button } from '@dflow/core/components/ui/button'
import { ScrollArea } from '@dflow/core/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@dflow/core/components/ui/sheet'
import { integrationsList } from '@dflow/core/lib/integrationList'

const GitHubDrawer = () => {
  const [activeSlide, setActiveSlide] = useQueryState(
    'active',
    parseAsString.withDefault(''),
  )

  const { execute, isPending, result } = useAction(getAllAppsAction)

  const integration = integrationsList.find(
    integration => integration.slug === 'github',
  )

  useEffect(() => {
    if (activeSlide === 'github' && !result?.data) {
      execute()
    }
  }, [activeSlide, result.data])

  const icon = integration ? (
    <div className='mb-2 flex size-14 items-center justify-center rounded-md border'>
      <div className='relative'>
        <integration.icon className='size-8 blur-lg saturate-200' />
        <integration.icon className='absolute inset-0 size-8' />
      </div>
    </div>
  ) : null

  return (
    <Sheet
      open={activeSlide === 'github'}
      onOpenChange={state => {
        setActiveSlide(state ? 'github' : '')
      }}>
      <SheetContent className='flex w-full flex-col justify-between sm:max-w-lg'>
        <SheetHeader className='text-left'>
          <SheetTitle className='flex w-full items-center gap-3 text-base'>
            {icon} Integration Settings
          </SheetTitle>

          <p className='pt-4 font-semibold'>{integration?.label}</p>
          <SheetDescription className='mt-0!'>
            {integration?.description}
          </SheetDescription>
        </SheetHeader>

        {isPending ? (
          <GithubIntegrationsLoading />
        ) : result?.serverError ? (
          <ScrollArea className='grow'>
            <AccessDeniedAlert error={result?.serverError} />
          </ScrollArea>
        ) : result.data ? (
          <ScrollArea className='grow'>
            <GitProviderList
              gitProviders={result.data}
              trigger={() => {
                execute()
              }}
            />
          </ScrollArea>
        ) : null}

        <SheetFooter>
          <CreateGitAppForm>
            <Button>
              <Link />
              Connect account
            </Button>
          </CreateGitAppForm>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default GitHubDrawer
