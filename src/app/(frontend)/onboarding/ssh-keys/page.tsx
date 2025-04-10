import Layout from '../../../../components/onboarding/OnboardingLayout'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import CreateSSHKeyForm from '@/components/security/CreateSSHKeyForm'
import SSHKeysList from '@/components/security/SSHKeysList'

const SuspendedPage = async () => {
  const payload = await getPayload({ config: configPromise })

  const { docs: sshKeys } = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  return (
    <Layout
      currentStep={1}
      cardTitle={'Add SSH Keys'}
      prevStepUrl={''}
      nextStepUrl={'/onboarding/add-server'}
      disableNextStep={sshKeys.length !== 0}>
      <CreateSSHKeyForm />

      {sshKeys.length ? (
        <div className='mt-8 space-y-4'>
          <h3 className='text-xl font-semibold'>SSH Keys</h3>
          <SSHKeysList keys={sshKeys} />
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
