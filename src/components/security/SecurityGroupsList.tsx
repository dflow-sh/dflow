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
  CheckCircle,
  Clock,
  ExternalLink,
  LinkIcon,
  RefreshCw,
  Shield,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  deleteSecurityGroupAction,
  syncSecurityGroupAction,
} from '@/actions/securityGroups'
import { CloudProviderAccount, SecurityGroup, Server } from '@/payload-types'

import UpdateSecurityGroup from './CreateSecurityGroup'

const syncStatusMap = {
  'in-sync': {
    label: 'In Sync',
    variant: 'default' as const,
    icon: <CheckCircle className='mr-1 h-3 w-3' />,
    className:
      'bg-green-900 text-green-200 border-green-700 ' +
      'hover:bg-green-800 hover:border-green-600',
  },
  'start-sync': {
    label: 'Syncing',
    variant: 'secondary' as const,
    icon: <RefreshCw className='mr-1 h-3 w-3 animate-spin' />,
    className:
      'bg-blue-900 text-blue-200 border-blue-700 ' +
      'hover:bg-blue-800 hover:border-blue-600',
  },
  pending: {
    label: 'Not Synced',
    variant: 'outline' as const,
    icon: <Clock className='mr-1 h-3 w-3' />,
    className:
      'bg-yellow-900 text-yellow-200 border-yellow-700 ' +
      'hover:bg-yellow-800 hover:border-yellow-600',
  },
  failed: {
    label: 'Failed',
    variant: 'destructive' as const,
    icon: <XCircle className='mr-1 h-3 w-3' />,
    className:
      'bg-red-900 text-red-200 border-red-700 ' +
      'hover:bg-red-800 hover:border-red-600',
  },
} as const

const SecurityGroupItem = ({
  securityGroup,
  cloudProviderAccounts,
  connectedServers = [],
}: {
  securityGroup: SecurityGroup
  cloudProviderAccounts: CloudProviderAccount[]
  connectedServers?: Partial<Server>[]
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const isConnectedToServers = connectedServers.length > 0

  const { execute: executeDelete, isPending: isDeletePending } = useAction(
    deleteSecurityGroupAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          toast.success(`Successfully deleted security group`)
          setIsDeleteDialogOpen(false)
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to delete security group: ${error.serverError}`)
        setIsDeleteDialogOpen(false)
      },
    },
  )

  const { execute: executeSync, isPending: isSyncPending } = useAction(
    syncSecurityGroupAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          toast.success(`Successfully synced security group`)
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to sync security group: ${error.serverError}`)
      },
    },
  )

  const status = securityGroup.syncStatus || 'pending'
  const statusConfig = syncStatusMap[status]

  // Check if required fields are missing
  const isMissingCloudProvider = !securityGroup.cloudProvider
  const isMissingAccount = !securityGroup.cloudProviderAccount
  const hasMissingFields = isMissingCloudProvider || isMissingAccount

  const handleSyncClick = () => {
    if (hasMissingFields) {
      let message = 'Cannot sync security group:'
      if (isMissingCloudProvider) message += ' Cloud provider is required.'
      if (isMissingAccount) message += ' Cloud provider account is required.'
      toast.warning(message, {
        duration: 5000,
      })
      return
    }
    executeSync({ id: securityGroup.id })
  }

  const handleDelete = () => {
    executeDelete({ id: securityGroup.id })
  }

  return (
    <>
      <Card className='transition-shadow hover:shadow-md'>
        <CardContent className='grid h-full w-full grid-cols-[auto,1fr,auto,auto] items-center gap-4 p-4'>
          <Shield className='flex-shrink-0' size={20} />

          <div className='min-w-0 space-y-1 overflow-hidden'>
            <div className='flex items-center gap-2'>
              <p className='truncate font-semibold'>{securityGroup.name}</p>
            </div>
            <p className='truncate text-sm text-muted-foreground'>
              {securityGroup.description}
            </p>
            {hasMissingFields && (
              <Alert variant='warning' className='mt-2 py-2'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle className='text-xs font-medium'>
                  Missing required configuration
                </AlertTitle>
                <AlertDescription className='text-xs'>
                  <ul className='ml-5 mt-1 list-disc space-y-1'>
                    {isMissingCloudProvider && (
                      <li>Cloud provider not selected</li>
                    )}
                    {isMissingAccount && (
                      <li>Cloud provider account not linked</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className='flex gap-2'>
            <Badge
              variant={statusConfig.variant}
              className={`items-center justify-center ${statusConfig.className}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>

            <Badge variant={isConnectedToServers ? 'info' : 'outline'}>
              <LinkIcon className='mr-1 h-3 w-3' />
              {isConnectedToServers
                ? `${connectedServers.length} Server${connectedServers.length > 1 ? 's' : ''}`
                : 'Not Linked'}
            </Badge>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              disabled={hasMissingFields || isSyncPending}
              onClick={handleSyncClick}
              size='icon'
              variant='outline'
              title={
                hasMissingFields
                  ? 'Cannot sync - missing required fields'
                  : 'Sync security group'
              }
              className='h-9 w-9 disabled:cursor-not-allowed'>
              <RefreshCw
                size={16}
                className={isSyncPending ? 'animate-spin' : ''}
              />
            </Button>

            <UpdateSecurityGroup
              securityGroup={securityGroup}
              type='update'
              description='This form updates security group'
              cloudProviderAccounts={cloudProviderAccounts}
            />

            <Button
              disabled={isDeletePending}
              onClick={() => setIsDeleteDialogOpen(true)}
              size='icon'
              variant='outline'
              title={
                isConnectedToServers
                  ? 'Warning: Security group in use'
                  : 'Delete security group'
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
              Delete Security Group
            </DialogTitle>
            <DialogDescription className='pt-2'>
              <div className='space-y-4'>
                <p>
                  Are you sure you want to delete the security group{' '}
                  <span className='font-medium'>{securityGroup.name}</span>?
                </p>

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
                            This security group is currently applied to the
                            following servers:
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
                              <span>
                                {server.name || `Server ${index + 1}`}
                              </span>
                            </div>
                            <Link href={`/servers/${server.id}`}>
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-8'>
                                View Server
                                <ExternalLink className='ml-1 h-4 w-4' />
                              </Button>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className='rounded-md border bg-destructive/10 p-3'>
                      <p className='text-sm text-destructive'>
                        <strong>Caution:</strong> Deleting this security group
                        may restrict access to ports that your applications are
                        using. Make sure you have alternative security groups in
                        place or understand the impact this will have on your
                        server connectivity.
                      </p>
                    </div>
                  </>
                )}

                {!isConnectedToServers && (
                  <div className='rounded-md border bg-muted p-3'>
                    <p className='text-sm'>
                      This security group is not connected to any servers. It
                      can be safely deleted.
                    </p>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-6 space-x-2'>
            <Button
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              disabled={isDeletePending}
              onClick={handleDelete}
              className='gap-1'>
              {!isDeletePending && <Trash2 size={16} />}
              {isDeletePending ? 'Deleting...' : 'Delete Security Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const SecurityGroupsList = ({
  securityGroups,
  cloudProviderAccounts,
  servers = [],
}: {
  securityGroups: SecurityGroup[]
  cloudProviderAccounts: CloudProviderAccount[]
  servers: Partial<Server>[]
}) => {
  return (
    <div className='mt-4 w-full space-y-3'>
      {securityGroups.map(group => {
        // Filter servers that use this security group
        const connectedServers = servers.filter(server =>
          server.awsEc2Details?.securityGroups?.some((sg: any) =>
            typeof sg === 'object' ? sg.id === group.id : sg === group.id,
          ),
        )

        return (
          <SecurityGroupItem
            securityGroup={group}
            key={group.id}
            cloudProviderAccounts={cloudProviderAccounts}
            connectedServers={connectedServers}
          />
        )
      })}
    </div>
  )
}

export default SecurityGroupsList
