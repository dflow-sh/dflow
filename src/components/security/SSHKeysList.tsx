'use client'

import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Badge } from '../ui/badge'
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
import {
  AlertCircle,
  ExternalLink,
  KeyRound,
  LinkIcon,
  Trash2,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { deleteSSHKeyAction } from '@/actions/sshkeys'
import { Server, SshKey } from '@/payload-types'

import ViewSSHKey from './CreateSSHKey'

const SSHKeyItem = ({
  sshKey,
  connectedServers = [],
}: {
  sshKey: SshKey
  connectedServers?: Partial<Server>[]
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const isConnectedToServers = connectedServers.length > 0

  const { execute: executeDelete, isPending: isDeletePending } = useAction(
    deleteSSHKeyAction,
    {
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
    },
  )

  const handleDelete = () => {
    executeDelete({ id: sshKey.id })
  }

  // Check if public key is missing
  const isMissingPublicKey = !sshKey.publicKey
  const hasMissingFields = isMissingPublicKey

  return (
    <>
      <Card className='transition-shadow hover:shadow-md'>
        <CardContent className='grid h-full w-full grid-cols-[auto,1fr,auto,auto] items-center gap-4 p-4'>
          <KeyRound className='flex-shrink-0' size={20} />

          <div className='min-w-0 space-y-1 overflow-hidden'>
            <div className='flex items-center gap-2'>
              <p className='truncate font-semibold'>{sshKey.name}</p>
            </div>
            <p className='truncate text-sm text-muted-foreground'>
              {sshKey.description}
            </p>
            {hasMissingFields && (
              <Alert variant='warning' className='mt-2 py-2'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle className='text-xs font-medium'>
                  Missing required configuration
                </AlertTitle>
                <AlertDescription className='text-xs'>
                  <ul className='ml-5 mt-1 list-disc space-y-1'>
                    {isMissingPublicKey && <li>Public key not configured</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Badge variant={isConnectedToServers ? 'info' : 'outline'}>
            <LinkIcon className='mr-1 h-3 w-3' />
            {isConnectedToServers
              ? `${connectedServers.length} Server${connectedServers.length > 1 ? 's' : ''}`
              : 'Not Linked'}
          </Badge>

          <div className='flex items-center gap-2'>
            <ViewSSHKey
              sshKey={sshKey}
              type='view'
              description='View SSH Key Details'
            />

            <Button
              disabled={isDeletePending}
              onClick={() => setIsDeleteDialogOpen(true)}
              size='icon'
              variant='outline'
              title={
                isConnectedToServers
                  ? 'Cannot delete - SSH key is in use'
                  : 'Delete SSH key'
              }
              className='h-9 w-9'>
              <Trash2 size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg'>
              <Trash2 className='h-5 w-5 text-destructive' />
              Delete SSH Key
            </DialogTitle>
            <DialogDescription className='pt-2'>
              Are you sure you want to delete the SSH key{' '}
              <span className='font-medium'>{sshKey.name}</span>?
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            {isConnectedToServers && (
              <>
                <div className='rounded-md border bg-warning/10 p-3'>
                  <div className='flex gap-2'>
                    <AlertCircle className='h-5 w-5 text-warning' />
                    <div>
                      <p className='font-medium text-warning'>
                        Warning: Connected Servers
                      </p>
                      <p className='text-sm'>
                        This SSH key is currently applied to the following
                        servers:
                      </p>
                    </div>
                  </div>

                  <ul className='mt-2 space-y-2'>
                    {connectedServers.map((server, index) => (
                      <li
                        key={index}
                        className='flex items-center justify-between border-t border-border pt-2'>
                        <div className='flex items-center gap-2'>
                          <LinkIcon className='h-4 w-4 text-muted-foreground' />
                          <span>{server.name || `Server ${index + 1}`}</span>
                        </div>
                        <div className='flex gap-2'>
                          <Link href={`/servers/${server.id}`}>
                            <Button size='sm' variant='outline' className='h-8'>
                              View Server
                              <ExternalLink className='ml-1 h-4 w-4' />
                            </Button>
                          </Link>
                          <Link href={`/servers/${server.id}/danger`}>
                            <Button
                              size='sm'
                              variant='secondary'
                              className='h-8'>
                              Detach Key
                              <ExternalLink className='ml-1 h-4 w-4' />
                            </Button>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='rounded-md border bg-destructive/10 p-3'>
                  <p className='text-sm text-destructive'>
                    <strong>Caution:</strong> Deleting this SSH key may prevent
                    access to your servers. Make sure you have alternative SSH
                    keys in place or understand the impact this will have on
                    your server connectivity.
                  </p>
                </div>
              </>
            )}

            {!isConnectedToServers && (
              <div className='rounded-md border bg-muted p-3'>
                <p className='text-sm'>
                  This SSH key is not connected to any servers. It can be safely
                  deleted.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className='mt-6 space-x-2'>
            <Button
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              disabled={isConnectedToServers || isDeletePending}
              onClick={handleDelete}
              className='gap-1'>
              {!isDeletePending && <Trash2 size={16} />}
              {isDeletePending ? 'Deleting...' : 'Delete SSH Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const SSHKeysList = ({
  keys,
  servers = [],
}: {
  keys: SshKey[]
  servers: Partial<Server>[]
}) => {
  return (
    <div className='mt-4 w-full space-y-3'>
      {keys.map(key => {
        // Filter servers that use this SSH key
        const connectedServers = servers.filter(server =>
          server.sshKey && typeof server.sshKey === 'object'
            ? server.sshKey.id === key.id
            : server.sshKey === key.id,
        )

        return (
          <SSHKeyItem
            sshKey={key}
            key={key.id}
            connectedServers={connectedServers}
          />
        )
      })}
    </div>
  )
}

export default SSHKeysList
