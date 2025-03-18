import configPromise from '@payload-config'
import { ArrowLeft } from 'lucide-react'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import SelectSearchComponent from '@/components/SelectSearchComponent'
import PluginsList from '@/components/servers/PluginsList'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ServerType } from '@/payload-types-overrides'

export default async function Page({
  searchParams,
}: {
  searchParams: { server?: string }
}) {
  const payload = await getPayload({ config: configPromise })

  const servers = await payload.find({
    collection: 'servers',
    pagination: false,
    context: {
      populateServerDetails: true,
    },
  })

  const selectedServerId = searchParams.server
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
    <Suspense fallback={<Loader />}>
      <div className='mx-auto flex h-screen max-w-2xl flex-col items-center justify-center px-5'>
        <Card className='w-[750px]'>
          <CardHeader>
            <div className='flex items-center text-sm font-extralight tracking-wide text-foreground'>
              <ArrowLeft className='mr-2 inline-block' size={16} />
              <div>
                STEP <span className='font-medium'>3</span> OF{' '}
                <span className='font-medium'>5</span>
              </div>
            </div>
            <div className='mb-4 mt-1.5 text-3xl font-semibold tracking-wide'>
              Install Dokku
            </div>
          </CardHeader>

          <CardContent>
            {/* <StepperComponent /> */}
            <SelectSearchComponent
              label={'Select a Server'}
              buttonLabel={'Select Server'}
              commandInputLabel={'Search Server...'}
              servers={servers.docs as ServerType[]}
              commandEmpty={'No such server.'}
            />
            {/* <div>
        If your server is disabled, it's either because your OS version isn't
        supported or Dokku isn't installed.
      </div> */}

            {/* <Button
        onClick={() =>
          selectedServer?.id && execute({ serverId: selectedServer.id })
        }>
        Sync Plugins
      </Button> */}
            {selectedServer && <PluginsList server={selectedServer} />}
          </CardContent>

          {/* <TimeLineComponent /> */}
        </Card>
      </div>
    </Suspense>
  )
}
