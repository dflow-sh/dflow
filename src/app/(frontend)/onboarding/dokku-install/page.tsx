import Layout from '../components/Layout'
import configPromise from '@payload-config'
import { SearchParams } from 'nuqs'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import { loadOnboardingDokkuInstall } from '@/lib/searchParams'
import { ServerType } from '@/payload-types-overrides'

import { ClientPage } from './page.client'

const SuspendedPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) => {
  const payload = await getPayload({ config: configPromise })

  const { docs: servers } = await payload.find({
    collection: 'servers',
    pagination: false,
    context: {
      populateServerDetails: true,
    },
  })

  const { server: selectedServerId } =
    await loadOnboardingDokkuInstall(searchParams)
  // const selectedServer = servers.docs.find(s => s.id === selectedServerId) as
  //   | ServerType
  //   | undefined

  //   console.log(
  //     'servers in dokku install step ',
  //     (servers.docs[0] as ServerType).os,
  //   )

  //   const { execute, isPending } = useAction(syncPluginAction, {
  //     onSuccess: ({ data }) => {
  //       if (data?.success) {
  //         toast.success('Successfully synced plugins')
  //       }
  //     },
  //   })

  return (
    <Layout
      currentStep={3}
      prevStepUrl='/onboarding/add-server'
      cardTitle={'Dokku Install'}
      nextStepUrl={'/onboarding/configure-domain'}
      disableNextStep={false}>
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
