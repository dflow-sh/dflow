import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import PageHeader from '@/components/PageHeader'
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
    <div>
      <PageHeader
        title='Git Providers'
        description="Connect your git-provider for deploying App's."
      />
      <CreateGitAppForm />

      <Suspense fallback={<Loader className='h-96 w-full' />}>
        <SuspendedPage />
      </Suspense>
    </div>
  )
}

export default GitPage
