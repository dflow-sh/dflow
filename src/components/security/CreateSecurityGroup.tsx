'use client'

import { Button } from '../ui/button'
import { Pencil, Plus, WandSparkles } from 'lucide-react'
import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { isDemoEnvironment } from '@/lib/constants'
import { CloudProviderAccount, SecurityGroup } from '@/payload-types'

import SecurityGroupForm from './CreateSecurityGroupForm'

const CreateSecurityGroup = ({
  type = 'create',
  description = 'This form allows you to add a security group to your cloud environment.',
  securityGroup,
  cloudProviderAccounts,
}: {
  type?: 'create' | 'update'
  description?: string
  securityGroup?: SecurityGroup
  cloudProviderAccounts: CloudProviderAccount[]
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const [generatedData, setGeneratedData] =
    useState<Omit<Partial<SecurityGroup>, 'id'>>()

  const generateCommonRules = () => {
    const awsAccount = cloudProviderAccounts.find(
      account => account.type === 'aws',
    )

    const commonData: Partial<SecurityGroup> = {
      name: 'MySecurityGroup',
      description: 'Security group with common rules',
      cloudProvider: 'aws',
      cloudProviderAccount: awsAccount?.id || '',
      inboundRules: [
        {
          description: 'SSH access',
          type: 'ssh',
          protocol: 'tcp',
          fromPort: 22,
          toPort: 22,
          sourceType: 'anywhere-ipv4',
          source: '0.0.0.0/0',
        },
        {
          description: 'HTTP access',
          type: 'http',
          protocol: 'tcp',
          fromPort: 80,
          toPort: 80,
          sourceType: 'anywhere-ipv4',
          source: '0.0.0.0/0',
        },
        {
          description: 'HTTPS access',
          type: 'https',
          protocol: 'tcp',
          fromPort: 443,
          toPort: 443,
          sourceType: 'anywhere-ipv4',
          source: '0.0.0.0/0',
        },
        {
          description: 'Custom application port',
          type: 'custom-tcp',
          protocol: 'tcp',
          fromPort: 3000,
          toPort: 3000,
          sourceType: 'anywhere-ipv4',
          source: '0.0.0.0/0',
        },
      ],
      outboundRules: [
        {
          description: 'Allow all outbound traffic',
          type: 'all-traffic',
          protocol: 'all',
          destinationType: 'anywhere-ipv4',
          destination: '0.0.0.0/0',
        },
      ],
      tags: [
        { key: 'Name', value: 'MySecurityGroup' },
        { key: 'Environment', value: 'Production' },
      ],
    }

    setGeneratedData(commonData)
    setOpen(true)
  }

  return (
    <div className='flex gap-2'>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={isDemoEnvironment}
            onClick={e => e.stopPropagation()}
            size={type === 'update' ? 'icon' : 'default'}
            variant={type === 'update' ? 'outline' : 'default'}>
            {type === 'update' ? (
              <Pencil className='h-4 w-4' />
            ) : (
              <>
                <Plus className='mr-2 h-4 w-4' />
                Add Security Group
              </>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className='sm:max-w-4xl'>
          <DialogHeader>
            <DialogTitle>
              {type === 'update' ? 'Edit Security Group' : 'Add Security Group'}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <SecurityGroupForm
            type={type}
            securityGroup={type === 'update' ? securityGroup : generatedData}
            setOpen={setOpen}
            cloudProviderAccounts={cloudProviderAccounts}
          />
        </DialogContent>
      </Dialog>

      {type === 'create' && (
        <Button
          variant='secondary'
          onClick={generateCommonRules}
          disabled={isDemoEnvironment}
          className='gap-2'>
          <WandSparkles className='h-4 w-4' />
          Quick Create
        </Button>
      )}
    </div>
  )
}

export default CreateSecurityGroup
