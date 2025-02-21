import configPromise from '@payload-config'
import { getPayload } from 'payload'

import CreateSSHKeyForm from '@/components/sshkeys/CreateSSHKeyForm'
import SSHKeysList from '@/components/sshkeys/SSHKeysList'

const SSHKeysPage = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs: keys } = await payload.find({
    collection: 'sshKeys',
    limit: 1000,
  })

  return (
    <section className='space-y-8'>
      <CreateSSHKeyForm />
      {keys.length ? <SSHKeysList keys={keys} /> : <p>No Keys Found!</p>}
    </section>
  )
}

export default SSHKeysPage
