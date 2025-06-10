import LayoutClient from '../../layout.client'

import { getCloudProvidersAccountsAction } from '@/actions/cloud'
import { getDFlowPlansAction } from '@/actions/cloud/dFlow'
import { getAddServerDetails } from '@/actions/pages/server'
import DflowCloudDrawer from '@/components/Integrations/dFlow/Drawer'
import ServerForm from '@/components/servers/ServerForm'

const SuspendedAddNewServerPage = async () => {
  const result = await getAddServerDetails()
  const dFlowAccount = await getCloudProvidersAccountsAction({ type: 'dFlow' })
  const vpsPlans = await getDFlowPlansAction()

  const sshKeys = result?.data?.sshKeys ?? []
  const securityGroups = result?.data?.securityGroups ?? []

  return (
    <>
      <ServerForm
        sshKeys={sshKeys}
        securityGroups={securityGroups}
        dFlowAccounts={dFlowAccount?.data}
        vpsPlans={vpsPlans?.data ?? []}
      />
      <DflowCloudDrawer />
    </>
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
