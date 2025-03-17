import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { CreateSSHKeyForm } from '@/components/sshkeys/CreateSSHKeyForm'

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const sshKeys = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  if (sshKeys.docs.length > 0) {
    redirect('/onboading/add-server')
  }

  return (
    <div className='mx-auto flex h-screen max-w-2xl flex-col items-center justify-center px-5'>
      <div className='flex items-center text-sm font-extralight tracking-wide text-foreground'>
        {/* <ArrowLeft className='mr-2 inline-block' size={16} /> */}
        <div>
          STEP <span className='font-medium'>1</span> OF{' '}
          <span className='font-medium'>4</span>
        </div>
      </div>
      <div className='mb-4 mt-1.5 text-3xl font-semibold tracking-wide'>
        Generate SSH Keys
      </div>

      {/* <StepperComponent /> */}

      <CreateSSHKeyForm />
    </div>
  )
}
