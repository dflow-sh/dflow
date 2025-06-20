import LayoutClient from '../../layout.client'

import { getDFlowPlansAction, getDflowUser } from '@/actions/cloud/dFlow'
import { getAddServerDetails } from '@/actions/pages/server'
import DflowCloudDrawer from '@/components/Integrations/dFlow/Drawer'
import ServerForm from '@/components/servers/ServerForm'

const SuspendedAddNewServerPage = async () => {
  const result = await getAddServerDetails()
  const dFlowDetails = await getDflowUser()
  const vpsPlans = await getDFlowPlansAction()

  const sshKeys = result?.data?.sshKeys ?? []
  const securityGroups = result?.data?.securityGroups ?? []

  return (
    <>
      <ServerForm
        sshKeys={sshKeys}
        securityGroups={securityGroups}
        dFlowAccounts={
          dFlowDetails?.data?.account ? [dFlowDetails?.data?.account] : []
        }
        vpsPlans={vpsPlans?.data ?? []}
        dFlowUser={dFlowDetails?.data?.user}
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
