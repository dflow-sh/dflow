import Layout from '../components/Layout'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import { CreateSSHKeyForm } from '@/components/sshkeys/CreateSSHKeyForm'

const SuspendedPage = async () => {
  const payload = await getPayload({ config: configPromise })

  const { docs: sshKeys } = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  const user = await payload.find({
    collection: 'users',
  })

  if (user.docs[0].onboarded) {
    redirect('/dashboard')
  }

  if (sshKeys.length > 0) {
    redirect('/onboarding/add-server')
  }

  return (
    <Layout
      currentStep={1}
      cardTitle={'Add SSH Keys'}
      prevStepUrl={''}
      nextStepUrl={'/onboarding/add-server'}
      disableNextStep={sshKeys.length !== 0}>
      <CreateSSHKeyForm />
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
