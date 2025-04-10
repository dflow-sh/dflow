'use client'

import { Button } from '../ui/button'
import { Pencil, Plus } from 'lucide-react'
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
import { SshKey } from '@/payload-types'

import CreateSSHKeyForm from './CreateSSHKeyForm'

const CreateSSHKey = ({
  type = 'create',
  description = 'This form allows you to add an SSH key manually or generate a new RSA or ED25519 key pair to populate the fields.',
  sshKey,
}: {
  type?: 'create' | 'update'
  description?: string
  sshKey?: SshKey
}) => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={isDemoEnvironment}
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
              Add SSH key
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {type === 'update' ? 'Edit SSH Key' : 'Add SSH key'}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <CreateSSHKeyForm type={type} sshKey={sshKey} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  )
}

export default CreateSSHKey
