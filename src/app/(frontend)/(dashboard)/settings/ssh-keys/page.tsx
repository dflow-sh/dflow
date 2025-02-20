import configPromise from '@payload-config'
import { Plus } from 'lucide-react'
import { getPayload } from 'payload'

import CreateSSHKeyForm from '@/components/sshkeys/CreateSSHKeyForm'
import SSHKeysList from '@/components/sshkeys/SSHKeysList'
import { Button } from '@/components/ui/button'

const SSHKeysPage = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs: keys } = await payload.find({
    collection: 'sshKeys',
    limit: 1000,
  })

  return (
    <section className='space-y-8'>
      {keys.length ? <SSHKeysList keys={keys} /> : <p>No Keys Found!</p>}

      <CreateSSHKeyForm>
        <Button>
          <Plus />
          Add SSH key
        </Button>
      </CreateSSHKeyForm>
    </section>
  )
}

export default SSHKeysPage
