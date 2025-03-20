import Layout from '../../../../components/onboarding/OnboardingLayout'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { SearchParams } from 'nuqs'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import { DomainFormWithoutDialog } from '@/components/servers/DomainForm'
import DomainList from '@/components/servers/DomainList'
import { loadOnboardingSelectedServer } from '@/lib/searchParams'

import ClientPage from './page.client'

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
  })

  const selectedServer = servers.find(
    serverDetails => serverDetails.id === server,
  )

  if (!selectedServer) {
    redirect(`/onboarding/dokku-install?server=${server}`)
  }

  return (
    <ClientPage>
      <Layout
        currentStep={4}
        cardTitle={'Configure Domain'}
        cardDescription={`🚀 Pro Tip: Don't have a domain no worries use nip.io wildcard domain: ${selectedServer.ip}.nip.io`}
        prevStepUrl={`/onboarding/dokku-install?server=${server}`}
        nextStepUrl={'/onboarding/install-github'}
        disableNextStep={!!(selectedServer.domains ?? []).length}>
        <DomainFormWithoutDialog server={selectedServer} />

        <div className='mt-8'>
          {(selectedServer.domains ?? []).length ? (
            <DomainList showForm={false} server={selectedServer} />
          ) : null}
        </div>
      </Layout>
    </ClientPage>
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
