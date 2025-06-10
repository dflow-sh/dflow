'use client'

import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { format } from 'date-fns'
import { Pencil, Trash2, Unlink } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'

import { deleteAWSAccountAction } from '@/actions/cloud/aws'
import { CloudProviderAccount } from '@/payload-types'

import AWSAccountForm from './aws/AWSAccountForm'

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
  if (account.type === 'aws') {
    return (
      <AWSAccountForm account={account} refetch={refetch}>
        <Button size='icon' variant='outline'>
          <Pencil size={20} />
        </Button>
      </AWSAccountForm>
    )
  }
}

const CloudProviderCard = ({
  account,
  refetch,
}: {
  account: CloudProviderAccount
  refetch?: RefetchType
}) => {
  const { execute: deleteAccount, isPending: deletingAccount } = useAction(
    deleteAWSAccountAction,
    {
      onSuccess: ({ data }) => {
        if (data?.id) {
          refetch?.({ type: 'aws' })
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
