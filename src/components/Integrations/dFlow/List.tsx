'use client'

import { format } from 'date-fns'
import { Pencil, Trash2, Unlink } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'

import { deleteAWSAccountAction } from '@/actions/cloud/aws'
import { deleteDFlowAccountAction } from '@/actions/cloud/dFlow'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { isDemoEnvironment } from '@/lib/constants'
import { CloudProviderAccount } from '@/payload-types'

import DFlowForm from './Form'

type RefetchType = (input: {
  type: 'aws' | 'azure' | 'gcp' | 'digitalocean' | 'dFlow'
}) => void

const EditForm = ({
  account,
  refetch,
}: {
  account: CloudProviderAccount
  refetch?: RefetchType
}) => {
  // Add support for both AWS and dFlow accounts
  if (account.type === 'aws' || account.type === 'dFlow') {
    return (
      <DFlowForm account={account} refetch={refetch}>
        <Button size='icon' variant='outline' disabled={isDemoEnvironment}>
          <Pencil size={20} />
        </Button>
      </DFlowForm>
    )
  }

  return null
}

const CloudProviderCard = ({
  account,
  refetch,
}: {
  account: CloudProviderAccount
  refetch?: RefetchType
}) => {
  const deleteAction =
    account.type === 'dFlow' ? deleteDFlowAccountAction : deleteAWSAccountAction

  const { execute: deleteAccount, isPending: deletingAccount } = useAction(
    deleteAction as any, // Type assertion to bypass strict typing
    {
      onSuccess: ({ data }: any) => {
        if (data?.id) {
          refetch?.({ type: account.type })
        }
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
          <EditForm account={account} refetch={refetch} />

          <Button
            size='icon'
            variant='outline'
            onClick={() => deleteAccount({ id: account.id })}
            disabled={deletingAccount || isDemoEnvironment}>
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
  return accounts.length ? (
    <div className='mt-4 space-y-4'>
      {accounts.map(account => {
        return (
          <CloudProviderCard
            account={account}
            key={account.id}
            refetch={refetch}
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
