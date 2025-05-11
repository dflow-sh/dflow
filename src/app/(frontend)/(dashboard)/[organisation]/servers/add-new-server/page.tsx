import LayoutClient from '../../../layout.client'
import { redirect } from 'next/navigation'

import { getAddServerDetails } from '@/actions/pages/server'
import ServerForm from '@/components/servers/ServerForm'
import { isDemoEnvironment } from '@/lib/constants'

const SuspendedAddNewServerPage = async () => {
  const result = await getAddServerDetails()
  const sshKeys = result?.data?.sshKeys ?? []
  const securityGroups = result?.data?.securityGroups ?? []

  return <ServerForm sshKeys={sshKeys} securityGroups={securityGroups} />
}

const AddNewServerPage = async () => {
  if (isDemoEnvironment) {
    redirect('/servers')
  }

  return (
    <LayoutClient>
      <SuspendedAddNewServerPage />
    </LayoutClient>
  )
}

export default AddNewServerPage
