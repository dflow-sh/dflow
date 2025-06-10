'use client'

import { Button } from '../ui/button'
import { Maximize, Minimize, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CloudProviderAccount, SecurityGroup } from '@/payload-types'

import SecurityGroupForm from './CreateSecurityGroupForm'

const CreateSecurityGroup = ({
  type = 'create',
  description = 'This form allows you to add a security group to your cloud environment.',
  securityGroup,
  cloudProviderAccounts,
  trigger,
}: {
  type?: 'create' | 'update'
  description?: string
  securityGroup?: Partial<SecurityGroup>
  cloudProviderAccounts: CloudProviderAccount[]
  trigger?: React.ReactNode
}) => {
  const [open, setOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
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
        )}
      </DialogTrigger>

      <DialogContent
        className={`${isFullScreen ? 'm-0 h-screen max-h-screen w-screen max-w-none p-6' : 'max-w-4xl'}`}>
        <div className={`flex flex-col ${isFullScreen ? 'h-full' : ''}`}>
          <DialogHeader className='mb-0 flex-shrink-0'>
            <DialogTitle>
              {type === 'update' ? 'Edit Security Group' : 'Add Security Group'}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className='absolute right-12 top-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={toggleFullScreen}
              aria-label={
                isFullScreen ? 'Exit full screen' : 'Enter full screen'
              }>
              {isFullScreen ? (
                <Minimize className='h-4 w-4' />
              ) : (
                <Maximize className='h-4 w-4' />
              )}
            </Button>
          </div>

          <div className={`mt-4 flex-1 ${isFullScreen ? 'h-full' : ''}`}>
            <SecurityGroupForm
              type={type}
              securityGroup={securityGroup}
              cloudProviderAccounts={cloudProviderAccounts}
              open={open}
              setOpen={setOpen}
              isFullScreen={isFullScreen}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSecurityGroup
