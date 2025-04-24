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

  return <ServerForm sshKeys={sshKeys} securityGroups={securityGroups} />
}

const AddNewServerPage = async () => {
  return (
    <LayoutClient>
      <SuspendedAddNewServerPage />
    </LayoutClient>
  )
}

export default AddNewServerPage
