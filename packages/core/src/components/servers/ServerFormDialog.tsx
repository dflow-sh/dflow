'use client'

import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'

import { SecurityGroup, SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

import AttachCustomServerForm from './AttachCustomServerForm'
import CreateEC2InstanceForm from './CreateEC2InstanceForm'

const ServerFormDialog = ({
  sshKeys,
  securityGroups,
  title = 'Add Server',
  formType = 'create',
  type,
  server,
}: {
  sshKeys: SshKey[]
  securityGroups?: SecurityGroup[]
  title?: string
  formType?: 'create' | 'update'
  type?: 'manual' | 'aws'
  server?: ServerType
}) => {
  const [open, setOpen] = useState(false)

  const renderForm = () => {
    switch (server?.provider) {
      case 'aws':
        return (
          <CreateEC2InstanceForm
            sshKeys={sshKeys}
            securityGroups={securityGroups}
            server={server}
            formType={formType}
            onSuccess={() => {
              setOpen(false)
            }}
          />
        )

      default:
        return (
          <AttachCustomServerForm
            sshKeys={sshKeys}
            server={server}
            formType={formType}
            onSuccess={() => {
              setOpen(false)
            }}
          />
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={formType === 'update' ? 'icon' : 'default'}
          variant={formType === 'update' ? 'outline' : 'default'}>
          {formType === 'update' ? (
            <>
              <Pencil />
            </>
          ) : (
            <>
              <Plus />
              Add Server
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className='w-full max-w-4xl'>
        <DialogHeader className='mb-2'>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            {formType === 'update' ? 'Update Server Details' : 'Attach Server'}
          </DialogDescription>
        </DialogHeader>

        {renderForm()}
      </DialogContent>
    </Dialog>
  )
}

export default ServerFormDialog
