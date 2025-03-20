import Layout from '../../../../components/onboarding/OnboardingLayout'
import configPromise from '@payload-config'
import { SearchParams } from 'nuqs'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import { loadOnboardingSelectedServer } from '@/lib/searchParams'
import { ServerType } from '@/payload-types-overrides'

import { ClientPage } from './page.client'

const SuspendedPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) => {
  const payload = await getPayload({ config: configPromise })
  const params = await searchParams
  const { server } = loadOnboardingSelectedServer(params)

  const { docs: servers } = await payload.find({
    collection: 'servers',
    pagination: false,
    context: {
      populateServerDetails: true,
    },
  })

  const selectedServer = servers.find(
    serverDetails => serverDetails.id === server,
  ) as ServerType | undefined

  const installationDone =
    !!selectedServer &&
    !!selectedServer.version &&
    selectedServer.version !== 'not-installed'

  const pluginsInstalled = (selectedServer?.plugins ?? []).find(
    plugin => plugin.name === 'letsencrypt',
  )

  const emailConfirmationDone =
    pluginsInstalled &&
    pluginsInstalled.configuration &&
    typeof pluginsInstalled.configuration === 'object' &&
    !Array.isArray(pluginsInstalled.configuration) &&
    pluginsInstalled.configuration.email

  return (
    <Layout
      currentStep={3}
      prevStepUrl='/onboarding/add-server'
      cardTitle={'Dokku Install'}
      nextStepUrl={`/onboarding/configure-domain${server ? `?server=${server}` : ''}`}
      disableNextStep={
        installationDone && !!pluginsInstalled && Boolean(emailConfirmationDone)
      }>
      <ClientPage servers={servers as ServerType[]} />
    </Layout>
  )
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  return (
    <Suspense fallback={<Loader className='min-h-screen w-full' />}>
      <SuspendedPage searchParams={searchParams} />
    </Suspense>
  )
}
