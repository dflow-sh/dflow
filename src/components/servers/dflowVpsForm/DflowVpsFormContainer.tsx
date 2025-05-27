'use client'

import { useState } from 'react'

import { VpsPlan } from '@/actions/cloud/dFlow/types'
import { CloudProviderAccount, SshKey } from '@/payload-types'

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
}: {
  vpsPlan: VpsPlan
  dFlowAccounts?: CloudProviderAccount[]
  selectedDFlowAccount?: CloudProviderAccount
  sshKeys: SshKey[]
}) => {
  const [selectedDFlowAccountId, setSelectedDFlowAccountId] = useState<string>(
    selectedDFlowAccount?.id || dFlowAccounts?.[0]?.id || '',
  )

  return (
    <DflowVpsFormProvider
      vpsPlan={vpsPlan}
      sshKeys={sshKeys}
      selectedAccountId={selectedDFlowAccountId}
      onAccountChange={setSelectedDFlowAccountId}>
      <div className='space-y-6'>
        <HeaderSection vpsPlan={vpsPlan} />
        <AccountSelectionSection
          dFlowAccounts={dFlowAccounts}
          selectedAccountId={selectedDFlowAccountId}
          onAccountChange={setSelectedDFlowAccountId}
        />
        <PaymentStatusSection />
        <SpecificationsSection vpsPlan={vpsPlan} />
        <TrafficSection vpsPlan={vpsPlan} />
        <OrderForm />
      </div>
    </DflowVpsFormProvider>
  )
}
