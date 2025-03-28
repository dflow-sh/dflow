'use client'

import LayoutClient from '../layout.client'
import { Settings } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { parseAsString, useQueryState } from 'nuqs'
import { useEffect } from 'react'

import { getAllAppsAction } from '@/actions/gitProviders'
import Loader from '@/components/Loader'
import CreateGitAppForm from '@/components/gitProviders/CreateGitAppForm'
import GitProviderList from '@/components/gitProviders/GitProviderList'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { integrationsList } from '@/lib/integrationList'

const GitHubSheet = () => {
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

  console.log(result.data)

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
          <SheetDescription>{integration?.description}</SheetDescription>
        </SheetHeader>

        {isPending && <Loader className='h-full w-full' />}

        {!isPending && result.data && (
          <ScrollArea className='flex-grow'>
            <GitProviderList gitProviders={result.data} />
          </ScrollArea>
        )}

        <SheetFooter>
          <CreateGitAppForm />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

const IntegrationsPage = () => {
  const [_, setActiveSlide] = useQueryState(
    'active',
    parseAsString.withDefault(''),
  )

  return (
    <LayoutClient>
      <section>
        <h3 className='text-2xl font-semibold'>Integrations</h3>

        <div className='mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {integrationsList.map(integration => (
            <Card className='h-full' key={integration.label}>
              <CardHeader className='pb-2'>
                <div className='mb-2 flex size-14 items-center justify-center rounded-md border'>
                  <div className='relative'>
                    <integration.icon className='size-8 blur-lg saturate-200' />
                    <integration.icon className='absolute inset-0 size-8' />
                  </div>
                </div>

                <CardTitle className='inline-flex gap-2'>
                  {integration.label}
                  <div className='relative'>
                    {!integration.live && (
                      <Badge className='absolute -top-1 w-max'>
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className='min-h-24 text-muted-foreground'>
                {integration.description}
              </CardContent>

              <CardFooter className='border-t py-4'>
                <Button
                  variant={'outline'}
                  onClick={() => {
                    setActiveSlide(integration.slug)
                  }}
                  disabled={!integration.live}>
                  <Settings /> Settings
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <GitHubSheet />
      </section>
    </LayoutClient>
  )
}

export default IntegrationsPage
