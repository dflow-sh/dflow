'use client'

import { useState } from 'react'

import { VpsPlan } from "@core/lib/restSDK/types"
import { CloudProviderAccount, SshKey } from "@core/payload-types"

import { AccountConnectionStatus } from "@core/components/servers/dflowVpsForm/AccountConnectionStatus"
import { AccountSelectionSection } from "@core/components/servers/dflowVpsForm/AccountSelectionSection"
import { DflowVpsFormProvider } from "@core/components/servers/dflowVpsForm/DflowVpsFormProvider"
import { HeaderSection } from "@core/components/servers/dflowVpsForm/HeaderSection"
import { OrderForm } from "@core/components/servers/dflowVpsForm/OrderForm"
import { PaymentStatusSection } from "@core/components/servers/dflowVpsForm/PaymentStatusSection"
import { SpecificationsSection } from "@core/components/servers/dflowVpsForm/SpecificationsSection"
import { TrafficSection } from "@core/components/servers/dflowVpsForm/TrafficSection"

export const DflowVpsFormContainer = ({
  vpsPlan,
  dFlowAccounts,
  selectedDFlowAccount,
  sshKeys,
  dFlowUser,
}: {
  vpsPlan: VpsPlan
  dFlowAccounts?: CloudProviderAccount[]
  selectedDFlowAccount?: CloudProviderAccount
  sshKeys: SshKey[]
  dFlowUser: any
}) => {
  const [selectedAccount, setSelectedAccount] = useState<{
    id: string
    token: string
  }>({
    id: dFlowAccounts?.[0]?.id || '',
    token: dFlowAccounts?.[0]?.dFlowDetails?.accessToken || '',
  })

  return (
    <DflowVpsFormProvider
      vpsPlan={vpsPlan}
      sshKeys={sshKeys}
      selectedAccount={selectedAccount}
      onAccountChange={setSelectedAccount}>
      <div className='space-y-6'>
        <HeaderSection vpsPlan={vpsPlan} />
        <AccountSelectionSection
          dFlowAccounts={dFlowAccounts}
          selectedAccount={selectedAccount}
          onAccountChange={setSelectedAccount}
        />
        <div className='space-y-3'>
          <AccountConnectionStatus />
          <PaymentStatusSection />
        </div>
        <SpecificationsSection vpsPlan={vpsPlan} />
        <TrafficSection vpsPlan={vpsPlan} />
        <OrderForm dFlowUser={dFlowUser} />
      </div>
    </DflowVpsFormProvider>
  )
}
