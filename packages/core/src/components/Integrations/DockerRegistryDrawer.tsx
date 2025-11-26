'use client'

import AccessDeniedAlert from "@core/components/AccessDeniedAlert"
import { Button } from "@core/components/ui/button"
import { Link } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { parseAsString, useQueryState } from 'nuqs'
import { useEffect } from 'react'

import { getDockerRegistries } from "@core/actions/dockerRegistry"
import GithubIntegrationsLoading from "@core/components/Integrations/GithubIntegrationsLoading"
import { ScrollArea } from "@core/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@core/components/ui/sheet"
import { integrationsList } from "@core/lib/integrationList"

import DockerRegistryForm from "@core/components/Integrations/dockerRegistry/Form"
import DockerRegistryList from "@core/components/Integrations/dockerRegistry/List"

const DockerRegistryDrawer = () => {
  const [activeSlide, setActiveSlide] = useQueryState(
    'active',
    parseAsString.withDefault(''),
  )

  const { execute, isPending, result } = useAction(getDockerRegistries)

  const integration = integrationsList.find(
    integration => integration.slug === 'docker-registry',
  )

  useEffect(() => {
    if (activeSlide === 'docker-registry' && !result?.data) {
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
      open={activeSlide === 'docker-registry'}
      onOpenChange={state => {
        setActiveSlide(state ? 'docker-registry' : '')
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
        ) : result.serverError ? (
          <ScrollArea className='grow'>
            <AccessDeniedAlert error={result?.serverError} />
          </ScrollArea>
        ) : result?.data ? (
          <ScrollArea className='grow'>
            <DockerRegistryList accounts={result.data} refetch={execute} />
          </ScrollArea>
        ) : null}

        <SheetFooter>
          <DockerRegistryForm refetch={execute}>
            <Button>
              <Link />
              Connect registry
            </Button>
          </DockerRegistryForm>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default DockerRegistryDrawer
