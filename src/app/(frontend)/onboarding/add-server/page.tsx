import Layout from '../../../../components/onboarding/OnboardingLayout'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import { CreateServerForm } from '@/components/servers/CreateServerForm'
import ServerList from '@/components/servers/ServerList'
import { ServerType } from '@/payload-types-overrides'

const SuspendedPage = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const { docs: sshKeys } = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  const { docs: servers } = await payload.find({
    collection: 'servers',
    pagination: false,
    context: {
      populateServerDetails: true,
    },
  })

  return (
    <Layout
      currentStep={2}
      cardTitle={'Add Server'}
      prevStepUrl={'/onboarding/ssh-keys'}
      nextStepUrl={'/onboarding/dokku-install'}
      disableNextStep={servers.length !== 0}>
      <CreateServerForm sshKeys={sshKeys} />

      {servers.length ? (
        <div className='mt-8'>
          <h3 className='text-xl font-semibold'>Servers</h3>
          <ServerList servers={servers as ServerType[]} sshKeys={sshKeys} />
        </div>
      ) : null}
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
