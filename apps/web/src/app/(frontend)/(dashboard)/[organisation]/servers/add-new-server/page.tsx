import {
  getDFlowPlansAction,
  getDflowUser,
} from '@dflow/core/actions/cloud/dFlow'
import { getAddServerDetails } from '@dflow/core/actions/pages/server'
import DflowCloudDrawer from '@dflow/core/components/Integrations/dFlow/Drawer'
import ServerForm from '@dflow/core/components/servers/ServerForm'
import LayoutClient from '../../layout.client'

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
        formType='create'
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
