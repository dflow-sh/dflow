'use client'

import { useState } from 'react'

import { VpsPlan } from '@/lib/restSDK/types'
import { CloudProviderAccount, SshKey } from '@/payload-types'

import { AccountConnectionStatus } from './AccountConnectionStatus'
import { AccountSelectionSection } from './AccountSelectionSection'
import { DflowVpsFormProvider } from './DflowVpsFormProvider'
import { HeaderSection } from './HeaderSection'
import { OrderForm } from './OrderForm'
import { PaymentStatusSection } from './PaymentStatusSection'
import { SpecificationsSection } from './SpecificationsSection'
import { TrafficSection } from './TrafficSection'

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
