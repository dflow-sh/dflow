'use client'

import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Shield, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

import { deleteSecurityGroupAction } from '@/actions/securityGroups'
import { isDemoEnvironment } from '@/lib/constants'
import { CloudProviderAccount, SecurityGroup } from '@/payload-types'

import UpdateSecurityGroup from './CreateSecurityGroup'

const SecurityGroupItem = ({
  securityGroup,
  cloudProviderAccounts,
}: {
  securityGroup: SecurityGroup
  cloudProviderAccounts: CloudProviderAccount[]
}) => {
  const { execute, isPending } = useAction(deleteSecurityGroupAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success(`Successfully deleted security group`)
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to delete security group: ${error.serverError}`)
    },
  })

  return (
    <Card>
      <CardContent className='flex h-24 w-full items-center justify-between gap-3 pt-4'>
        <div className='flex items-center gap-3'>
          <Shield size={20} />

          <div>
            <p className='font-semibold'>{securityGroup.name}</p>
            <span className='text-sm text-muted-foreground'>
              {securityGroup.description}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <UpdateSecurityGroup
            securityGroup={securityGroup}
            type='update'
            description='This form updates security group'
            cloudProviderAccounts={cloudProviderAccounts}
          />

          <Button
            disabled={isPending || isDemoEnvironment}
            onClick={() => {
              execute({ id: securityGroup.id })
            }}
            size='icon'
            variant='outline'>
            <Trash2 size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const SecurityGroupsList = ({
  securityGroups,
  cloudProviderAccounts,
}: {
  securityGroups: SecurityGroup[]
  cloudProviderAccounts: CloudProviderAccount[]
}) => {
  return (
    <div className='mt-4 w-full space-y-4'>
      {securityGroups.map(group => (
        <SecurityGroupItem
          securityGroup={group}
          key={group.id}
          cloudProviderAccounts={cloudProviderAccounts}
        />
      ))}
    </div>
  )
}

export default SecurityGroupsList
