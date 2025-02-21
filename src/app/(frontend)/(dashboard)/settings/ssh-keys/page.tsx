import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import PageHeader from '@/components/PageHeader'
import CreateSSHKeyForm from '@/components/sshkeys/CreateSSHKeyForm'
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
      <PageHeader title='SSH Keys' action={<CreateSSHKeyForm />} />

      <Suspense fallback={<Loader className='h-96 w-full' />}>
        <SuspendedPage />
      </Suspense>
    </section>
  )
}

export default SSHKeysPage
