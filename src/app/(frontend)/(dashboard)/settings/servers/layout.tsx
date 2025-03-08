import configPromise from '@payload-config'
import { Plus } from 'lucide-react'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import CreateServer from '@/components/servers/CreateServerForm'
import { Button } from '@/components/ui/button'

interface PageProps {
  children: React.ReactNode
}

const SuspendedAddServer = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs: keys } = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  return <CreateServer sshKeys={keys} />
}

const ServerLayout = ({ children }: PageProps) => {
  return (
    <div>
      <PageHeader
        title='Servers'
        action={
          <Suspense
            fallback={
              <Button disabled>
                <Plus />
                Add Server
              </Button>
            }>
            <SuspendedAddServer />
          </Suspense>
        }
      />
      {children}
    </div>
  )
}

export default ServerLayout
