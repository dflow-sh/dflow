'use client'

import { Settings } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { integrationsList } from '@/lib/integrationList'

const IntegrationsList = () => {
  const [_, setActiveSlide] = useQueryState(
    'active',
    parseAsString.withDefault(''),
  )

  return (
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
                  <Badge className='absolute -top-1 w-max'>Coming Soon</Badge>
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
  )
}

export default IntegrationsList
