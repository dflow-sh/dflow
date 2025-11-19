import { Dispatch, SetStateAction } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CloudProviderAccount } from '@/payload-types'

export const AccountSelectionSection = ({
  dFlowAccounts,
  selectedAccount,
  onAccountChange,
}: {
  dFlowAccounts?: CloudProviderAccount[]
  selectedAccount: {
    id: string
    token: string
  }
  onAccountChange: Dispatch<
    SetStateAction<{
      id: string
      token: string
    }>
  >
}) => {
  if (!dFlowAccounts || dFlowAccounts.length === 0) return null

  const handleAccountChange = (accountId: string) => {
    const account = dFlowAccounts?.find(acc => acc.id === accountId)
    if (account) {
      onAccountChange({
        id: account.id,
        token: account.dFlowDetails?.accessToken || '',
      })
    }
  }

  return (
    <div className='space-y-2'>
      <label className='text-sm font-medium text-foreground'>
        Select Account
      </label>
      <Select value={selectedAccount.id} onValueChange={handleAccountChange}>
        <SelectTrigger className='bg-background'>
          <SelectValue placeholder='Choose a dFlow account' />
        </SelectTrigger>
        <SelectContent>
          {dFlowAccounts.map(account => (
            <SelectItem key={account.id} value={account.id}>
              <div className='flex items-center gap-2'>
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10'>
                  <span className='text-xs font-medium text-primary'>
                    {(account.name || 'dFlow Account').charAt(0).toUpperCase()}
                  </span>
                </div>
                <span>{account.name || 'dFlow Account'}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
