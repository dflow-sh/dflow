import Layout from '../components/Layout'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import { CreateSSHKeyForm } from '@/components/sshkeys/CreateSSHKeyForm'

const SuspendedPage = async () => {
  const payload = await getPayload({ config: configPromise })

  const sshKeys = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  if (sshKeys.docs.length > 0) {
    redirect('/onboarding/add-server')
  }

  return (
    <Layout currentStep={1} cardTitle={'Add SSH Keys'} prevStepUrl={''}>
      <CreateSSHKeyForm />
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
