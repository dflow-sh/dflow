import LayoutClient from '../../layout.client'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import CreateSSHKey from '@/components/sshkeys/CreateSSHKeyForm'
import SSHKeysList from '@/components/sshkeys/SSHKeysList'

const SuspendedPage = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs: keys } = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  return keys.length ? <SSHKeysList keys={keys} /> : <p>No Keys Found!</p>
}

const SSHKeysPage = async () => {
  return (
    <section>
      <Suspense fallback={<Loader className='h-96 w-full' />}>
        <LayoutClient>
          <div className='flex items-center justify-between'>
            <div className='text-2xl font-semibold'>SSH Keys</div>

            <CreateSSHKey />
          </div>
          <SuspendedPage />
        </LayoutClient>
      </Suspense>
    </section>
  )
}

export default SSHKeysPage
