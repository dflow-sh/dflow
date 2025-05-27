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
  selectedAccountId,
  onAccountChange,
}: {
  dFlowAccounts?: CloudProviderAccount[]
  selectedAccountId: string
  onAccountChange: (accountId: string) => void
}) => {
  if (!dFlowAccounts || dFlowAccounts.length === 0) return null

  return (
    <div className='my-6'>
      <Select value={selectedAccountId} onValueChange={onAccountChange}>
        <SelectTrigger className='bg-background'>
          <SelectValue placeholder='Select dFlow account' />
        </SelectTrigger>
        <SelectContent>
          {dFlowAccounts.map(account => (
            <SelectItem key={account.id} value={account.id}>
              {account.name || 'dFlow Account'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
