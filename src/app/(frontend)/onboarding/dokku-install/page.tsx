import Layout from '../components/Layout'
import configPromise from '@payload-config'
import { SearchParams } from 'nuqs'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import SelectSearchComponent from '@/components/SelectSearchComponent'
import PluginsList from '@/components/servers/PluginsList'
import { loadOnboardingDokkuInstall } from '@/lib/searchParams'
import { ServerType } from '@/payload-types-overrides'

const SuspendedPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) => {
  const payload = await getPayload({ config: configPromise })

  const servers = await payload.find({
    collection: 'servers',
    pagination: false,
    context: {
      populateServerDetails: true,
    },
  })

  const { server: selectedServerId } =
    await loadOnboardingDokkuInstall(searchParams)
  const selectedServer = servers.docs.find(s => s.id === selectedServerId) as
    | ServerType
    | undefined

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
      cardTitle={'Dokku Install'}>
      <SelectSearchComponent
        label={'Select a Server'}
        buttonLabel={'Select Server'}
        commandInputLabel={'Search Server...'}
        servers={servers.docs as ServerType[]}
        commandEmpty={'No such server.'}
      />
      {selectedServer && <PluginsList server={selectedServer} />}
    </Layout>
  )
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  return (
    <Suspense fallback={<Loader className='h-96 w-full' />}>
      <SuspendedPage searchParams={searchParams} />
    </Suspense>
  )
}
