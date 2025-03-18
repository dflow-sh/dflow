import Layout from '../components/Layout'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import { CreateServerForm } from '@/components/servers/CreateServerForm'

const SuspendedPage = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const sshKeys = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  const { docs: servers } = await payload.find({
    collection: 'servers',
    pagination: false,
  })

  return (
    <Layout
      currentStep={2}
      cardTitle={'Add Server'}
      prevStepUrl={'/onboarding/ssh-keys'}
      nextStepUrl={'/onboarding/dokku-install'}
      disableNextStep={servers.length !== 0}>
      <CreateServerForm sshKeys={sshKeys.docs} />
    </Layout>
  )
}

export default async function Page() {
  return (
    <Suspense fallback={<Loader className='min-h-screen w-full' />}>
      <SuspendedPage />
    </Suspense>
  )
}
