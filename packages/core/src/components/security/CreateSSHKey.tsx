'use client'

import { Button } from '../ui/button'
import { Eye, Plus } from 'lucide-react'
import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SshKey } from '@/payload-types'

import CreateSSHKeyForm from './CreateSSHKeyForm'

const CreateSSHKey = ({
  type = 'create',
  description = 'This form allows you to add an SSH key manually or generate a new RSA or ED25519 key pair to populate the fields.',
  sshKey,
  trigger,
}: {
  type?: 'create' | 'view'
  description?: string
  sshKey?: SshKey
  trigger?: React.ReactNode
}) => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            onClick={e => e.stopPropagation()}
            size={type === 'view' ? 'icon' : 'default'}
            variant={type === 'view' ? 'outline' : 'default'}>
            {type === 'view' ? (
              <>
                <Eye />
              </>
            ) : (
              <>
                <Plus />
                Add SSH key
              </>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {type === 'view' ? 'View SSH Key' : 'Add SSH key'}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <CreateSSHKeyForm type={type} sshKey={sshKey} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  )
}

export default CreateSSHKey
