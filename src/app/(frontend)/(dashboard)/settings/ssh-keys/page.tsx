import LayoutClient from '../../layout.client'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import CreateSSHKey from '@/components/sshkeys/CreateSSHKeyForm'
import SSHKeysList from '@/components/sshkeys/SSHKeysList'

import SSHLoading from './SSHLoading'

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
      <Suspense fallback={<SSHLoading />}>
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
