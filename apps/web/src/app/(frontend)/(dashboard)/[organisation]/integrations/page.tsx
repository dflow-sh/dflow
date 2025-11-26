'use client'

import { Suspense } from 'react'
import { Link } from 'lucide-react'
import dynamic from 'next/dynamic'
import IntegrationsList from '@dflow/core/components/Integrations/IntegrationsList'
import { IntegrationsSkeleton } from '@dflow/core/components/skeletons/IntegrationsSkeleton'
import LayoutClient from '../layout.client'

const GitHubDrawer = dynamic(
  () => import('@dflow/core/components/Integrations/GithubDrawer'),
  {
    ssr: false,
  },
)
const AWSDrawer = dynamic(
  () => import('@dflow/core/components/Integrations/AWSDrawer'),
  {
    ssr: false,
  },
)

const DockerRegistryDrawer = dynamic(
  () => import('@dflow/core/components/Integrations/DockerRegistryDrawer'),
  { ssr: false },
)

const DflowCloudDrawer = dynamic(
  () => import('@dflow/core/components/Integrations/dFlow/Drawer'),
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
        <div className='inline-flex items-center gap-2 text-2xl font-semibold'>
          <Link />
          <h3>Integrations</h3>
        </div>

        <Suspense fallback={<IntegrationsSkeleton />}>
          <SuspendedIntegrationsPage />
        </Suspense>
      </section>
    </LayoutClient>
  )
}

export default IntegrationsPage
