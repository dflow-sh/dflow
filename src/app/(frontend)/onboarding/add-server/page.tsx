import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { CreateServerForm } from '@/components/servers/CreateServerForm'

export default async function Page() {
  const payload = await getPayload({
    config: configPromise,
  })

  const sshKeys = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  const servers = await payload.find({
    collection: 'servers',
    pagination: false,
  })

  if (servers.docs.length > 0) {
    redirect('/onboarding/configure-domain')
  }

  return (
    <div className='mx-auto flex h-screen max-w-2xl flex-col items-center justify-center px-5'>
      <div className='flex items-center text-sm font-extralight tracking-wide text-foreground'>
        {/* <ArrowLeft className='mr-2 inline-block' size={16} /> */}
        <div>
          STEP <span className='font-medium'>2</span> OF{' '}
          <span className='font-medium'>4</span>
        </div>
      </div>
      <div className='mb-4 mt-1.5 text-3xl font-semibold tracking-wide'>
        Add Server
      </div>

      {/* <StepperComponent /> */}

      <CreateServerForm sshKeys={sshKeys.docs} />
    </div>
  )
}
