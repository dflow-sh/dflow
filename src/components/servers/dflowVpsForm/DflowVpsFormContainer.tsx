'use client'

import { parseAsString, useQueryState } from 'nuqs'
import { useState } from 'react'

import { VpsPlan } from '@/actions/cloud/dFlow/types'
import { CloudProviderAccount, SshKey } from '@/payload-types'

import { AccountConnectionStatus } from './AccountConnectionStatus'
import { AccountSelectionSection } from './AccountSelectionSection'
import { DflowVpsFormProvider } from './DflowVpsFormProvider'
import { HeaderSection } from './HeaderSection'
import { OrderForm } from './OrderForm'
import { PaymentStatusSection } from './PaymentStatusSection'
import { TrafficSection } from './TrafficSection'
import { VpsPlansSection } from './VpsPlansSections'

export const DflowVpsFormContainer = ({
  vpsPlan,
  dFlowAccounts,
  selectedDFlowAccount,
  sshKeys,
  dFlowUser,
  vpsPlans = [],
}: {
  vpsPlan?: VpsPlan
  dFlowAccounts?: CloudProviderAccount[]
  selectedDFlowAccount?: CloudProviderAccount
  sshKeys: SshKey[]
  dFlowUser: any
  vpsPlans?: VpsPlan[]
}) => {
  const [option, setOption] = useQueryState(
    'option',
    parseAsString.withDefault(''),
  )

  const [selectedAccount, setSelectedAccount] = useState<{
    id: string
    token: string
  }>({
    id: dFlowAccounts?.[0]?.id || '',
    token: dFlowAccounts?.[0]?.dFlowDetails?.accessToken || '',
  })

  // Get the current selected plan from either vpsPlan prop or from query params
  const currentPlan = vpsPlan || vpsPlans.find(plan => plan.slug === option)

  const handlePlanChange = (planSlug: string) => {
    setOption(planSlug)
  }

  // Handle case when no plan is selected or matched
  if (!currentPlan) {
    return (
      <div className='text-sm text-muted-foreground'>
        Please select a valid plan to continue.
      </div>
    )
  }
  return (
    <DflowVpsFormProvider
      vpsPlan={currentPlan}
      sshKeys={sshKeys}
      selectedAccount={selectedAccount}
      onAccountChange={setSelectedAccount}>
      <div className='space-y-6'>
        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between'>
          <HeaderSection vpsPlan={currentPlan} />
          <AccountSelectionSection
            dFlowAccounts={dFlowAccounts}
            selectedAccount={selectedAccount}
            onAccountChange={setSelectedAccount}
          />
        </div>

        {/* VPS Plans Selection */}
        {vpsPlans && vpsPlans.length > 0 && (
          <VpsPlansSection
            vpsPlans={vpsPlans}
            selectedPlan={option}
            onPlanChange={handlePlanChange}
          />
        )}

        <div className='space-y-3'>
          <AccountConnectionStatus />
          <PaymentStatusSection />
        </div>

        {/* <SpecificationsSection vpsPlan={currentPlan} /> */}
        <TrafficSection vpsPlan={currentPlan} />
        <OrderForm dFlowUser={dFlowUser} />
      </div>
    </DflowVpsFormProvider>
  )
}
