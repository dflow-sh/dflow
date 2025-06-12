'use client'

import { format } from 'date-fns'
import { Pencil, Trash2, Unlink } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'

import { deleteDFlowAccountAction } from '@/actions/cloud/dFlow'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CloudProviderAccount } from '@/payload-types'

import DFlowForm from './Form'

type RefetchType = (input: {
  type: 'aws' | 'azure' | 'gcp' | 'digitalocean' | 'dFlow'
}) => void

const CloudProviderCard = ({
  account,
  refetch,
  existingAccountsCount = 0,
}: {
  account: CloudProviderAccount
  refetch?: RefetchType
  existingAccountsCount?: number
}) => {
  const { execute: deleteAccount, isPending: deletingAccount } = useAction(
    deleteDFlowAccountAction,
    {
      onSuccess: ({ data }: any) => {
        if (data?.id) refetch?.({ type: account.type })
      },
    },
  )

  return (
    <Card key={account.id}>
      <CardContent className='flex w-full items-center justify-between gap-3 pt-4'>
        <div className='flex items-center gap-3'>
          <div>
            <p className='font-semibold'>{account?.name}</p>
            <time className='text-sm text-muted-foreground'>
              {format(new Date(account.createdAt), 'LLL d, yyyy h:mm a')}
            </time>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          {/* Edit and Delete actions */}
          <DFlowForm
            account={account}
            refetch={refetch}
            existingAccountsCount={existingAccountsCount}>
            <Button size='icon' variant='outline'>
              <Pencil size={20} />
            </Button>
          </DFlowForm>

          <Button
            size='icon'
            variant='outline'
            onClick={() => deleteAccount({ id: account.id })}
            disabled={deletingAccount}>
            <Trash2 size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const CloudProvidersList = ({
  accounts,
  refetch,
}: {
  accounts: CloudProviderAccount[]
  refetch?: RefetchType
}) => {
  const existingAccountsCount = accounts.length

  return accounts.length ? (
    <div className='mt-4 space-y-4'>
      {accounts.map(account => {
        return (
          <CloudProviderCard
            account={account}
            key={account.id}
            refetch={refetch}
            existingAccountsCount={existingAccountsCount}
          />
        )
      })}
    </div>
  ) : (
    <div className='flex h-40 w-full flex-col items-center justify-center gap-3 text-muted-foreground'>
      <Unlink size={28} />
      <p>No Accounts connected!</p>
    </div>
  )
}

export default CloudProvidersList
