import configPromise from '@payload-config'
import { ArrowLeft } from 'lucide-react'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import { CreateServerForm } from '@/components/servers/CreateServerForm'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default async function Page() {
  const payload = await getPayload({
    config: configPromise,
  })

  const sshKeys = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  const { docs: servers } = await payload.find({
    collection: 'servers',
    pagination: false,
  })

  // if (servers.length > 0) {
  //   redirect('/onboarding/configure-domain')
  // }

  return (
    <Suspense fallback={<Loader />}>
      <div className='mx-auto flex h-screen max-w-2xl flex-col items-center justify-center px-5'>
        <Card className='w-[750px]'>
          <CardHeader>
            <div className='flex items-center text-sm font-extralight tracking-wide text-foreground'>
              <ArrowLeft className='mr-2 inline-block' size={16} />
              <div>
                STEP <span className='font-medium'>2</span> OF{' '}
                <span className='font-medium'>5</span>
              </div>
            </div>
            <div className='mb-4 mt-1.5 text-3xl font-semibold tracking-wide'>
              Add Server
            </div>
          </CardHeader>

          {/* <StepperComponent /> */}

          <CardContent>
            <CreateServerForm sshKeys={sshKeys.docs} />
          </CardContent>
        </Card>
      </div>
    </Suspense>
  )
}
