import LayoutClient from '../layout.client'
import { Suspense, lazy } from 'react'

import { IntegrationsSkeleton } from '@/components/skeletons/IntegrationsSkeleton'

const GitHubDrawer = lazy(
  () => import('@/components/Integrations/GithubDrawer'),
)
const AWSDrawer = lazy(() => import('@/components/Integrations/AWSDrawer'))
const IntegrationsList = lazy(
  () => import('@/components/Integrations/IntegrationsList'),
)

const SuspendedIntegrationsPage = () => {
  return (
    <>
      <IntegrationsList />
      <GitHubDrawer />
      <AWSDrawer />
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
