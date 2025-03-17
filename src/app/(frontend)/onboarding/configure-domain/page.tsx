import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { DomainFormWithoutDialog } from '@/components/servers/DomainForm'
import { ServerType } from '@/payload-types-overrides'

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const allServers = await payload.find({
    collection: 'servers',
    pagination: false,
    context: {
      populateServerDetails: true,
    },
  })

  const { docs: serverDocs } = allServers

  console.log('domains are ', !serverDocs[0]?.domains?.length)

  if (serverDocs[0]?.domains?.length) {
    redirect('/onboarding/install-github')
  }

  if (serverDocs[0]) {
    // return to add-server onboarding page.
  }

  return (
    <div className='mx-auto flex h-screen max-w-2xl flex-col items-center justify-center px-5'>
      <div className='flex items-center text-sm font-extralight tracking-wide text-foreground'>
        {/* <ArrowLeft className='mr-2 inline-block' size={16} /> */}
        <div>
          STEP <span className='font-medium'>3</span> OF{' '}
          <span className='font-medium'>4</span>
        </div>
      </div>
      <div className='mb-4 mt-1.5 text-3xl font-semibold tracking-wide'>
        Configure Domain
      </div>

      {/* <StepperComponent /> */}

      <DomainFormWithoutDialog server={serverDocs[0] as ServerType} />
    </div>
  )
}
