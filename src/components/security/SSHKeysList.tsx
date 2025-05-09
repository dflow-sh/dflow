'use client'

import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { AlertTriangle, ExternalLink, KeyRound, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { deleteSSHKeyAction } from '@/actions/sshkeys'
import { isDemoEnvironment } from '@/lib/constants'
import { Server, SshKey } from '@/payload-types'

import UpdateSSHKey from './CreateSSHKey'

const SSHKeyItem = ({
  sshKey,
  servers,
}: {
  sshKey: SshKey
  servers: Partial<Server>[]
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const connectedServers = servers
  const isConnectedToServers = connectedServers.length > 0

  const { execute, isPending } = useAction(deleteSSHKeyAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success(`Successfully deleted SSH key`)
        setIsDeleteDialogOpen(false)
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to delete SSH key: ${error.serverError}`)
      setIsDeleteDialogOpen(false)
    },
  })

  const handleDelete = () => {
    if (!isConnectedToServers) {
      execute({ id: sshKey.id })
    }
  }

  return (
    <>
      <Card>
        <CardContent className='flex h-24 w-full items-center justify-between gap-3 pt-4'>
          <div className='flex items-center gap-3'>
            <KeyRound size={20} />

            <div>
              <p className='font-semibold'>{sshKey.name}</p>
              <span className='text-sm text-muted-foreground'>
                {sshKey.description}
              </span>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <UpdateSSHKey
              sshKey={sshKey}
              type='view'
              description='This form updates SSH key'
            />

            <Button
              disabled={isPending || isDemoEnvironment}
              onClick={() => setIsDeleteDialogOpen(true)}
              size='icon'
              variant='outline'>
              <Trash2 size={20} />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg'>
              {isConnectedToServers ? (
                <>
                  <AlertTriangle className='h-5 w-5 text-warning' />
                  Cannot Delete SSH Key
                </>
              ) : (
                <>
                  <Trash2 className='h-5 w-5 text-destructive' />
                  Delete SSH Key
                </>
              )}
            </DialogTitle>
            <DialogDescription className='pt-2'>
              {isConnectedToServers ? (
                <div className='space-y-4'>
                  <p className='font-medium'>
                    This SSH key is currently connected to the following
                    servers:
                  </p>
                  <div className='rounded-md border bg-muted p-3'>
                    <ul className='space-y-2'>
                      {connectedServers.map((server, index) => (
                        <li
                          key={index}
                          className='flex items-center justify-between'>
                          <span className='font-medium'>
                            {server.name || `Server ${index + 1}`}
                          </span>
                          <div className='flex gap-2'>
                            <Link href={`/servers/${server.id}`}>
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-8'>
                                Detach Key
                                <ExternalLink className='ml-1 h-4 w-4' />
                              </Button>
                            </Link>
                            <Link href={`/servers/${server.id}/danger`}>
                              <Button
                                size='sm'
                                variant='secondary'
                                className='h-8'>
                                Server Settings
                                <ExternalLink className='ml-1 h-4 w-4' />
                              </Button>
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p>
                    To delete this SSH key, you need to first detach it from all
                    connected servers using the "Detach Key" button.
                    Alternatively, you can delete each connected server from its
                    danger zone page.
                  </p>
                </div>
              ) : (
                <div className='space-y-3 pt-2'>
                  <p>
                    Are you sure you want to delete{' '}
                    <span className='font-medium'>{sshKey.name}</span>?
                  </p>
                  <div className='rounded-md border bg-destructive/10 p-3'>
                    <p className='text-sm text-destructive'>
                      This action cannot be undone. The key will be permanently
                      removed from the system.
                    </p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-6 space-x-2'>
            <Button
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            {!isConnectedToServers && (
              <Button
                variant='destructive'
                disabled={isPending}
                onClick={handleDelete}
                className='gap-1'>
                {isPending ? 'Deleting...' : 'Delete SSH Key'}
                {!isPending && <Trash2 size={16} />}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const SSHKeysList = ({
  keys,
  servers,
}: {
  keys: SshKey[]
  servers: Partial<Server>[]
}) => {
  return (
    <div className='mt-4 w-full space-y-4'>
      {keys.map(key => (
        <SSHKeyItem
          sshKey={key}
          key={key.id}
          servers={servers.filter(server =>
            server.sshKey && typeof server.sshKey === 'object'
              ? server.sshKey.id === key.id
              : server.sshKey === key.id,
          )}
        />
      ))}
    </div>
  )
}

export default SSHKeysList
