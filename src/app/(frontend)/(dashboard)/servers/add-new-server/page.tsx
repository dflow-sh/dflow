import LayoutClient from '../../layout.client'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { use } from 'react'

import ServerForm from '@/components/servers/ServerForm'

const SuspendedAddNewServerPage = () => {
  const payload = use(getPayload({ config: configPromise }))

  const [{ docs: sshKeys }, { docs: securityGroups }] = use(
    Promise.all([
      payload.find({ collection: 'sshKeys', pagination: false }),
      payload.find({ collection: 'securityGroups', pagination: false }),
    ]),
  )

  return (
    <div>
      <div className='mb-4'>
        <h2 className='mb-1 text-2xl font-semibold'>
          Choose a Deployment Option
        </h2>
        <p className='text-muted-foreground'>
          Select a cloud provider or add server details manually
        </p>
      </div>
      <ServerForm sshKeys={sshKeys} securityGroups={securityGroups} />
    </div>
  )
}

const AddNewServerPage = async () => {
  return (
    <LayoutClient>
      <SuspendedAddNewServerPage />
    </LayoutClient>
  )
}

export default AddNewServerPage
