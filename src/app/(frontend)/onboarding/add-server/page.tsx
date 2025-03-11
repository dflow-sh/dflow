import configPromise from '@payload-config'
import { ArrowLeft } from 'lucide-react'
import { getPayload } from 'payload'

import { CreateServerForm } from '@/components/servers/CreateServerForm'

export default async function Page() {
  const payload = await getPayload({
    config: configPromise,
  })

  const sshKeys = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  return (
    <div className=''>
      <div className='flex items-center text-sm font-extralight tracking-wide text-foreground'>
        <ArrowLeft className='mr-2 inline-block' size={16} />
        <div>
          STEP <span className='font-medium'>2</span> OF{' '}
          <span className='font-medium'>4</span>
        </div>
      </div>
      <div className='text-3xl font-semibold tracking-wide'>Add Server</div>

      <CreateServerForm sshKeys={sshKeys.docs} />
    </div>
  )
}
