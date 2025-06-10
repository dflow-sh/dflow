'use client'

import LayoutClient from '../layout.client'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

import IntegrationsList from '@/components/Integrations/IntegrationsList'
import { IntegrationsSkeleton } from '@/components/skeletons/IntegrationsSkeleton'

const GitHubDrawer = dynamic(
  () => import('@/components/Integrations/GithubDrawer'),
  {
    ssr: false,
  },
)
const AWSDrawer = dynamic(() => import('@/components/Integrations/AWSDrawer'), {
  ssr: false,
})

const DockerRegistryDrawer = dynamic(
  () => import('@/components/Integrations/DockerRegistryDrawer'),
  { ssr: false },
)

const DflowCloudDrawer = dynamic(
  () => import('@/components/Integrations/dFlow/Drawer'),
)

const SuspendedIntegrationsPage = () => {
  return (
    <>
      <IntegrationsList />

      <GitHubDrawer />
      <AWSDrawer />
      <DockerRegistryDrawer />
      <DflowCloudDrawer />
    </>
  )
}

const IntegrationsPage = () => {
  return (
    <LayoutClient>
      <section>
        <h3 className='text-2xl font-semibold'>Integrations</h3>

        <Suspense fallback={<IntegrationsSkeleton />}>
          <SuspendedIntegrationsPage />
        </Suspense>
      </section>
    </LayoutClient>
  )
}

export default IntegrationsPage
