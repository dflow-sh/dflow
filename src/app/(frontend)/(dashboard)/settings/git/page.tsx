import LayoutClient from '../../layout.client'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import CreateGitAppForm from '@/components/gitProviders/CreateGitAppForm'
import GitProviderList from '@/components/gitProviders/GitProviderList'

const SuspendedPage = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs: gitProvidersList } = await payload.find({
    collection: 'gitProviders',
    pagination: false,
  })

  return <GitProviderList gitProviders={gitProvidersList} />
}

const GitPage = () => {
  return (
    <Suspense fallback={<Loader className='h-96 w-full' />}>
      <LayoutClient>
        <div className='flex items-center justify-between'>
          <div className='text-2xl font-semibold'>Git</div>
          <CreateGitAppForm />
        </div>
        <SuspendedPage />
      </LayoutClient>
    </Suspense>
  )
}

export default GitPage
