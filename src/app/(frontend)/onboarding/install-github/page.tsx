import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import CreateGitAppForm from '@/components/gitProviders/CreateGitAppForm'
import GitProviderList from '@/components/gitProviders/GitProviderList'

export default async function Page() {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })

  const gitProviders = await payload.find({
    collection: 'gitProviders',
    pagination: false,
  })

  const { docs: gitProvidersDocs } = gitProviders

  const { user } = await payload.auth({ headers: headersList })

  console.log('docs are ', gitProviders)

  if (gitProvidersDocs[0]) {
    await payload.update({
      collection: 'users',
      id: user?.id ?? '',
      data: {
        onboarded: true,
      },
    })
    redirect('/dashboard')
  }

  return (
    <div className='mx-auto flex h-screen max-w-2xl flex-col items-center justify-center px-5'>
      <div className='flex items-center text-sm font-extralight tracking-wide text-foreground'>
        {/* <ArrowLeft className='mr-2 inline-block' size={16} /> */}
        <div>
          STEP <span className='font-medium'>4</span> OF{' '}
          <span className='font-medium'>4</span>
        </div>
      </div>
      <div className='mb-4 mt-1.5 text-3xl font-semibold tracking-wide'>
        Add Git Source
      </div>

      {/* <StepperComponent /> */}

      <CreateGitAppForm />
      <GitProviderList gitProviders={gitProvidersDocs} />
    </div>
  )
}
