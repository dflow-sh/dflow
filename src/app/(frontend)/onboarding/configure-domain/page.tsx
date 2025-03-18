import Layout from '../components/Layout'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import { DomainFormWithoutDialog } from '@/components/servers/DomainForm'
import { ServerType } from '@/payload-types-overrides'

const SuspendedPage = async () => {
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
    <Layout
      currentStep={4}
      cardTitle={'Configure Domain'}
      prevStepUrl={'/onboarding/dokku-install'}>
      <DomainFormWithoutDialog server={serverDocs[0] as ServerType} />
    </Layout>
  )
}

export default async function Page() {
  return (
    <Suspense fallback={<Loader className='h-96 w-full' />}>
      <SuspendedPage />
    </Suspense>
  )
}
