'use client'

import { Button } from '../ui/button'
import { env } from 'env'
import { Pencil, Plus } from 'lucide-react'
import { Dispatch, SetStateAction, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SecurityGroup } from '@/payload-types'

import CreateSecurityGroupForm from './CreateSecurityGroupForm'

const CreateSecurityGroup = ({
  type = 'create',
  description = 'This form allows you to add a security group to your cloud environment.',
  securityGroup,
}: {
  type?: 'create' | 'update'
  description?: string
  securityGroup?: SecurityGroup
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const isDemo = env.NEXT_PUBLIC_ENVIRONMENT === 'DEMO'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={isDemo}
          onClick={e => e.stopPropagation()}
          size={type === 'update' ? 'icon' : 'default'}
          variant={type === 'update' ? 'outline' : 'default'}>
          {type === 'update' ? (
            <>
              <Pencil />
            </>
          ) : (
            <>
              <Plus />
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

        <CreateSecurityGroupForm
          type={type}
          securityGroup={securityGroup}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  )
}

export default CreateSecurityGroup
